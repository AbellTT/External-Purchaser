# Generated manually to keep the catalog/brand rollout deployable.

import django.core.validators
import django.db.models.deletion
from decimal import Decimal
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Brand',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('image_url', models.TextField(blank=True)),
                ('stock_quantity', models.PositiveIntegerField(default=0)),
                ('is_in_stock', models.BooleanField(default=True)),
                ('regular_market_price', models.DecimalField(decimal_places=2, max_digits=10, validators=[django.core.validators.MinValueValidator(Decimal('0.00'))])),
                ('merkato_retailer_price', models.DecimalField(decimal_places=2, max_digits=10, validators=[django.core.validators.MinValueValidator(Decimal('0.00'))])),
                ('direct_purchase_price', models.DecimalField(decimal_places=2, max_digits=10, validators=[django.core.validators.MinValueValidator(Decimal('0.00'))])),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='brands', to='products.product')),
            ],
            options={'db_table': 'product_brands', 'ordering': ['name']},
        ),
        migrations.AddConstraint(
            model_name='brand',
            constraint=models.UniqueConstraint(fields=('product', 'name'), name='unique_brand_per_product'),
        ),
    ]
