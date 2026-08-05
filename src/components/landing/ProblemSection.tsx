'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, ArrowDown } from 'lucide-react'

/* ── Data ─────────────────────────────────────────────────── */
const oldWay = {
  nodes: [
    { label: 'Your Institution', sub: 'Needs A4 Paper (80gsm)' },
    { label: 'Local Retailer / Stationery Shop', sub: '+15% retail markup' },
    { label: 'Commission Agent / Broker', sub: '+10% middleman margin' },
    { label: 'Merkato Wholesale Distributor', sub: '+8% distributor margin' },
    { label: 'Importer / Paper Mill', sub: 'Original Wholesale Cost' },
  ],
  price: 'ETB 1,000 / ream',
  delta: 'Up to 35% cumulative markups',
  positive: false,
}

const newWay = {
  nodes: [
    { label: 'Your Institution', sub: '+ participating organizations this cycle' },
    { label: 'Group Purchasing Aggregation', sub: 'Pools collective institutional volume', highlight: true },
    { label: 'Vetted Wholesale Suppliers', sub: 'Direct volume wholesale access' },
  ],
  price: 'ETB 880–920 / ream',
  delta: 'Save up to 12% below retail reference',
  positive: true,
}

type Tab = 'old' | 'new'

const variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit:  (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
}

/* ── Component ─────────────────────────────────────────────── */
export function ProblemSection() {
  const [tab, setTab] = useState<Tab>('old')
  const [dir, setDir] = useState(1)

  const switchTo = (t: Tab) => {
    if (t === tab) return
    setDir(t === 'new' ? 1 : -1)
    setTab(t)
  }

  const data = tab === 'old' ? oldWay : newWay

  return (
    <section className="section-pad bg-background">
      <div className="container-base">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-label text-primary mb-3">The Problem</p>
          <h2 className="text-h1 text-foreground">Why Traditional Procurement Costs More</h2>
          <p className="text-body-md text-muted-foreground mt-4">
            Every intermediary between your organization and the supplier adds a margin.
            Most institutions unknowingly absorb 3–5 markup layers before receiving their stationery.
          </p>
        </div>

        {/* Toggle Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-muted rounded-full p-1 border border-border shadow-inner">
            <button
              onClick={() => switchTo('old')}
              className={`relative px-7 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                tab === 'old'
                  ? 'bg-card text-error shadow-md border border-error/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'old' && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-error animate-pulse" />
              )}
              The Old Way
            </button>
            <button
              onClick={() => switchTo('new')}
              className={`relative px-7 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                tab === 'new'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Our Platform
            </button>
          </div>
        </div>

        {/* Flow Card */}
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={tab}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="bg-card border border-border rounded-2xl p-10 shadow-lg"
            >
              {/* Flow nodes */}
              <div className="flex flex-col items-center gap-0">
                {data.nodes.map((node, i) => {
                  const isFirst = i === 0
                  const isLast  = i === data.nodes.length - 1
                  const isHighlight = 'highlight' in node && node.highlight

                  return (
                    <div key={node.label} className="flex flex-col items-center w-full">
                      {/* Node */}
                      <div className={`w-full rounded-xl px-5 py-3.5 text-center border transition-all ${
                        isFirst
                          ? 'bg-muted border-border'
                          : isHighlight
                          ? 'bg-primary border-primary text-primary-foreground'
                          : isLast
                          ? tab === 'old'
                            ? 'bg-muted border-border'
                            : 'bg-primary-subtle border-primary/20'
                          : tab === 'old'
                          ? 'bg-card border-error/20'
                          : 'bg-card border-border'
                      }`}>
                        <p className={`text-base font-bold ${
                          isHighlight ? 'text-primary-foreground' : 'text-foreground'
                        }`}>{node.label}</p>
                        <p className={`text-sm mt-0.5 ${
                          isHighlight ? 'text-primary-foreground/75' : 'text-muted-foreground'
                        }`}>{node.sub}</p>
                      </div>

                      {/* Connector + margin badge */}
                      {!isLast && (
                        <div className="flex flex-col items-center my-1 gap-0.5">
                          <div className={`w-px h-3 ${tab === 'old' ? 'bg-error/30' : 'bg-primary/30'}`} />
                          {tab === 'old' && (
                            <span className="text-xs font-bold text-error bg-error/10 border border-error/20 rounded-full px-2.5 py-0.5">
                              {['', '+12%', '+9%', '+7%', '+5%'][i]}
                            </span>
                          )}
                          <ArrowDown className={`w-3 h-3 ${tab === 'old' ? 'text-error/50' : 'text-primary/50'}`} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Bottom price summary */}
              <div className={`mt-7 pt-6 border-t border-border rounded-b-xl text-center`}>
                <p className="text-sm text-muted-foreground mb-1">
                  {data.positive ? 'What you actually pay' : 'What you end up paying'}
                </p>
                <p className={`text-3xl font-bold font-display mb-2 ${
                  data.positive ? 'text-primary' : 'text-error'
                }`}>
                  {data.price}
                </p>
                <div className={`inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-full ${
                  data.positive
                    ? 'bg-primary-subtle text-primary'
                    : 'bg-error/10 text-error'
                }`}>
                  {data.positive
                    ? <CheckCircle className="w-3.5 h-3.5" />
                    : <XCircle    className="w-3.5 h-3.5" />
                  }
                  {data.delta}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  )
}
