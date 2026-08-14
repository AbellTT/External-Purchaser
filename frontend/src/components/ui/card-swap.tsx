import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react'
import gsap from 'gsap'

/* ── Card primitive ── */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  customClass?: string
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ customClass, children, className, ...rest }, ref) => (
    <div
      ref={ref}
      {...rest}
      className={[
        'absolute top-1/2 left-1/2 rounded-xl border border-border shadow-xl',
        'flex flex-col items-start justify-center p-8',
        '[transform-style:preserve-3d] [will-change:transform] [backface-visibility:hidden]',
        customClass ?? '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  )
)
Card.displayName = 'Card'

/* ── Helpers ── */
const makeSlot = (i: number, distX: number, distY: number, total: number) => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i,
})

const placeNow = (
  el: HTMLElement,
  slot: ReturnType<typeof makeSlot>,
  skew: number
) =>
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: 'center center',
    zIndex: slot.zIndex,
    force3D: true,
  })

/* ── CardSwap ── */
export interface CardSwapHandle {
  swap: () => void
}

interface CardSwapProps {
  width?: number
  height?: number
  cardDistance?: number
  verticalDistance?: number
  skewAmount?: number
  easing?: 'elastic' | 'power'
  children: React.ReactNode
  className?: string
}

const CardSwap = forwardRef<CardSwapHandle, CardSwapProps>(
  (
    {
      width = 400,
      height = 300,
      cardDistance = 30,
      verticalDistance = 30,
      skewAmount = 2,
      easing = 'elastic',
      children,
      className = '',
    },
    ref
  ) => {
    const config =
      easing === 'elastic'
        ? {
            ease: 'elastic.out(0.6,0.9)',
            durDrop: 1.4,
            durMove: 1.4,
            durReturn: 1.4,
            promoteOverlap: 0.9,
            returnDelay: 0.05,
          }
        : {
            ease: 'power1.inOut',
            durDrop: 0.7,
            durMove: 0.7,
            durReturn: 0.7,
            promoteOverlap: 0.45,
            returnDelay: 0.2,
          }

    const childArr = useMemo(() => Children.toArray(children), [children])
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const refs = useMemo(
      () => childArr.map(() => React.createRef<HTMLDivElement>()),
      [childArr.length]
    )

    const order = useRef(Array.from({ length: childArr.length }, (_, i) => i))
    const tlRef = useRef<gsap.core.Timeline | null>(null)
    const container = useRef<HTMLDivElement>(null)

    /* Initial placement */
    useEffect(() => {
      const total = refs.length
      refs.forEach((r, i) => {
        if (r.current) {
          placeNow(
            r.current,
            makeSlot(i, cardDistance, verticalDistance, total),
            skewAmount
          )
        }
      })
    }, [cardDistance, verticalDistance, skewAmount, refs])

    /* Swap logic — exposed to parent via ref */
    const swap = useCallback(() => {
      if (order.current.length < 2) return
      if (tlRef.current?.isActive()) return // block while animating

      const [front, ...rest] = order.current
      const elFront = refs[front]?.current
      if (!elFront) return

      const tl = gsap.timeline()
      tlRef.current = tl

      tl.to(elFront, {
        y: '+=500',
        duration: config.durDrop,
        ease: config.ease,
      })

      tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`)
      rest.forEach((idx, i) => {
        const el = refs[idx]?.current
        if (!el) return
        const slot = makeSlot(i, cardDistance, verticalDistance, refs.length)
        tl.set(el, { zIndex: slot.zIndex }, 'promote')
        tl.to(
          el,
          { x: slot.x, y: slot.y, z: slot.z, duration: config.durMove, ease: config.ease },
          `promote+=${i * 0.12}`
        )
      })

      const backSlot = makeSlot(refs.length - 1, cardDistance, verticalDistance, refs.length)
      tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`)
      tl.call(
        () => { gsap.set(elFront, { zIndex: backSlot.zIndex }) },
        undefined,
        'return'
      )
      tl.to(
        elFront,
        { x: backSlot.x, y: backSlot.y, z: backSlot.z, duration: config.durReturn, ease: config.ease },
        'return'
      )
      tl.call(() => {
        order.current = [...rest, front]
      })
    }, [refs, cardDistance, verticalDistance, config])

    useImperativeHandle(ref, () => ({ swap }), [swap])

    const rendered = childArr.map((child, i) => {
      if (!isValidElement(child)) return child
      const r = refs[i] as React.RefObject<HTMLDivElement>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return cloneElement(child as React.ReactElement<any>, {
        key: i,
        ref: r,
        style: {
          width,
          height,
          ...((child.props as CardProps).style ?? {}),
        },
      })
    })

    return (
      <div
        ref={container}
        className={`relative [perspective:1200px] overflow-visible ${className}`}
        style={{ width, height }}
      >
        {rendered}
      </div>
    )
  }
)
CardSwap.displayName = 'CardSwap'

export default CardSwap
