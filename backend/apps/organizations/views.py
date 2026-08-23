import json
import threading
import re
import urllib.request
import requests as http_requests
from django.conf import settings
from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Q
from django.utils import timezone
from django.core.paginator import Paginator
from django.contrib.auth import get_user_model

from .models import Organization
from .serializers import OrganizationSerializer
from apps.notifications.models import Notification
from apps.notifications.utils import send_user_notification


def _send_notification(event_data):
    try:
        req = urllib.request.Request(
            'http://127.0.0.1:8003/',
            data=json.dumps(event_data).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        urllib.request.urlopen(req, timeout=1)
    except Exception:
        pass


def _notify_websocket(event_data):
    """Fire-and-forget async notification thread."""
    threading.Thread(target=_send_notification, args=(event_data,), daemon=True).start()


class AdminOrganizationListView(views.APIView):
    """
    GET /api/organizations/admin/
    Returns paginated organizations for admin management with status filter and search.
    Query params: ?status=PENDING&search=...&page=1&pageSize=10
    """
    permission_classes = [AllowAny]

    def get(self, request):
        status_filter = request.query_params.get('status', '').strip().upper()
        search = request.query_params.get('search', '').strip()
        page = max(int(request.query_params.get('page', 1)), 1)
        page_size = min(max(int(request.query_params.get('pageSize', 10)), 1), 100)

        queryset = Organization.objects.all()

        if status_filter and status_filter != 'ALL':
            queryset = queryset.filter(verification_status=status_filter)

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(tin_number__icontains=search) |
                Q(phone_number__icontains=search) |
                Q(organization_type__icontains=search)
            )

        queryset = queryset.order_by('-created_at')
        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page)

        serializer = OrganizationSerializer(page_obj.object_list, many=True)

        all_orgs = Organization.objects.all()
        summary = {
            'total': all_orgs.count(),
            'pending': all_orgs.filter(verification_status='PENDING').count(),
            'verified': all_orgs.filter(verification_status='VERIFIED').count(),
            'rejected': all_orgs.filter(verification_status='REJECTED').count(),
        }

        return Response({
            'success': True,
            'data': {
                'organizations': serializer.data,
                'pagination': {
                    'currentPage': page_obj.number,
                    'totalPages': paginator.num_pages,
                    'totalOrganizations': paginator.count,
                    'pageSize': page_size,
                },
                'summary': summary,
            },
        })


class AdminOrganizationApproveView(views.APIView):
    """
    POST /api/organizations/admin/<id>/approve/
    Admin approves an organization registration.
    """
    permission_classes = [AllowAny]

    def post(self, request, pk):
        try:
            org = Organization.objects.get(pk=pk)
        except Organization.DoesNotExist:
            return Response({'success': False, 'error': 'Organization not found.'}, status=status.HTTP_404_NOT_FOUND)

        org.verification_status = 'VERIFIED'
        org.verified_at = timezone.now()
        org.save()

        # Update all users associated with this organization
        org.users.update(is_verified=True)

        # Send approval notification to all org users (no action_url needed)
        for org_user in org.users.all():
            send_user_notification(
                user=org_user,
                title='Organization Verified — Welcome to MBE External Purchaser!',
                message=(
                    f'Congratulations! Your organization "{org.name}" has been verified and approved. '
                    f'You now have full access to procurement baskets and direct purchases on MBE External Purchaser.'
                ),
                notification_type=Notification.NotificationType.ORGANIZATION_APPROVED,
                action_url='',
            )

        # Notify via WebSocket broadcast
        _notify_websocket({
            'type': 'ORGANIZATION_STATUS_CHANGED',
            'orgId': org.id,
            'orgName': org.name,
            'verificationStatus': 'approved',
            'verifiedAt': org.verified_at.isoformat() if org.verified_at else None,
        })

        serializer = OrganizationSerializer(org)
        return Response({
            'success': True,
            'message': f'Organization "{org.name}" has been approved and verified.',
            'data': serializer.data,
        })


class AdminOrganizationRejectView(views.APIView):
    """
    POST /api/organizations/admin/<id>/reject/
    Admin rejects an organization registration.
    """
    permission_classes = [AllowAny]

    def post(self, request, pk):
        try:
            org = Organization.objects.get(pk=pk)
        except Organization.DoesNotExist:
            return Response({'success': False, 'error': 'Organization not found.'}, status=status.HTTP_404_NOT_FOUND)

        notes = request.data.get('notes', '').strip()
        org.verification_status = 'REJECTED'
        if notes:
            org.verification_notes = notes
        org.save()

        # Send rejection notification to all org users
        for org_user in org.users.all():
            send_user_notification(
                user=org_user,
                title='Organization Registration Not Approved',
                message=(
                    f'Unfortunately, your organization "{org.name}" registration was not approved. '
                    + (f'Reason: {notes}. ' if notes else '')
                    + 'Please contact support on MBE External Purchaser for more information.'
                ),
                notification_type=Notification.NotificationType.ORGANIZATION_REJECTED,
                action_url='/dashboard/profile',
            )

        # Notify via WebSocket broadcast
        _notify_websocket({
            'type': 'ORGANIZATION_STATUS_CHANGED',
            'orgId': org.id,
            'orgName': org.name,
            'verificationStatus': 'suspended',
            'verificationNotes': notes,
        })

        serializer = OrganizationSerializer(org)
        return Response({
            'success': True,
            'message': f'Organization "{org.name}" registration has been rejected.',
            'data': serializer.data,
        })


class AdminTINVerifyView(views.APIView):
    """
    GET /api/organizations/admin/tin-verify/?tin=<TIN>
    Admin utility: proxy a TIN lookup to the Ethiopian Ministry of Revenue.
    Returns only the taxpayer object from the MoR response.
    The orders array is intentionally stripped and never forwarded to the client.

    SSL note: The Ethiopian MoR web server uses an intermediate CA certificate that is
    not included in standard CA bundles (certifi, system CAs). The MOR_VERIFY_SSL
    Django setting controls SSL verification for this specific external endpoint.
    Set MOR_VERIFY_SSL=True in production once the MoR fixes their certificate chain.
    """
    permission_classes = [AllowAny]

    MOR_BASE_URL = 'https://www.mor.gov.et/api/invoices/'
    TIMEOUT_SECONDS = 15

    # Simple validation: non-empty, digits only (leading zeros preserved as string)
    _TIN_RE = re.compile(r'^\d{1,15}$')

    def get(self, request):
        tin = request.query_params.get('tin', '').strip()

        if not tin:
            return Response(
                {'success': False, 'error': 'TIN is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not self._TIN_RE.match(tin):
            return Response(
                {'success': False, 'error': 'Invalid TIN format. TIN must contain digits only.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        mor_url = f'{self.MOR_BASE_URL}{tin}'

        # MOR_VERIFY_SSL defaults False because the Ethiopian MoR endpoint uses an
        # intermediate CA not present in standard bundles. Set True in production
        # once the Ministry fixes their certificate chain.
        verify_ssl = getattr(settings, 'MOR_VERIFY_SSL', False)

        try:
            resp = http_requests.get(
                mor_url,
                timeout=self.TIMEOUT_SECONDS,
                verify=verify_ssl,
                headers={'Accept': 'application/json', 'User-Agent': 'MBEExternalPurchaser/1.0'},
            )

            if resp.status_code == 404:
                return Response(
                    {'success': False, 'error': 'TIN not found. Please check the TIN and try again.'},
                    status=status.HTTP_404_NOT_FOUND,
                )

            if not resp.ok:
                return Response(
                    {'success': False, 'error': f'Ministry of Revenue returned an error (HTTP {resp.status_code}). Please try again later.'},
                    status=status.HTTP_502_BAD_GATEWAY,
                )

            try:
                payload = resp.json()
            except (ValueError, Exception):
                return Response(
                    {'success': False, 'error': 'Unexpected response from Ministry of Revenue.'},
                    status=status.HTTP_502_BAD_GATEWAY,
                )

            taxpayer = payload.get('taxpayer')
            if not taxpayer or not isinstance(taxpayer, dict):
                return Response(
                    {'success': False, 'error': 'TIN not found.'},
                    status=status.HTTP_404_NOT_FOUND,
                )

            return Response({
                'success': True,
                'taxpayer': {
                    'name': taxpayer.get('name') or '',
                    'taxAuthority': taxpayer.get('taxAuthority') or '',
                    'taxCenter': taxpayer.get('taxCenter') or '',
                    'region': taxpayer.get('region') or '',
                },
            })

        except http_requests.exceptions.SSLError:
            return Response(
                {'success': False, 'error': 'Unable to establish a secure connection to the Ministry of Revenue. Please contact the system administrator.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        except http_requests.exceptions.Timeout:
            return Response(
                {'success': False, 'error': 'The Ministry of Revenue did not respond in time. Please try again.'},
                status=status.HTTP_504_GATEWAY_TIMEOUT,
            )

        except http_requests.exceptions.ConnectionError:
            return Response(
                {'success': False, 'error': 'Could not connect to the Ministry of Revenue. Please try again later.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        except Exception:
            return Response(
                {'success': False, 'error': 'An unexpected error occurred during TIN verification. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
