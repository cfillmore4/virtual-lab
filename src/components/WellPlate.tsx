import { useState, useRef, useCallback } from 'react'
import { useExperimentStore, GROUP_COLORS, ROWS, COLS } from '../store/experimentStore'
import { EXPERIMENT_CONFIGS } from '../types/experiment'

export default function WellPlate() {
  const { experimentType, wells, fillWells, resetWells, setScreen } = useExperimentStore()
  const [colorIndex, setColorIndex] = useState(0)

  const isDraggingRef = useRef(false)
  const dragModeRef = useRef<'fill' | 'clear'>('fill') // fill or clear based on first well clicked

  const cfg = experimentType ? EXPERIMENT_CONFIGS[experimentType] : null
  const accentColor = cfg?.accentColor ?? '#00d4ff'
  const filledCount = wells.filter((w) => w.filled).length
  const canRun = filledCount > 0


  const handleMouseDown = useCallback((id: string) => {
    isDraggingRef.current = true
    const well = wells.find((w) => w.id === id)!
    dragModeRef.current = well.filled ? 'clear' : 'fill'
    if (dragModeRef.current === 'fill') {
      fillWells([id], `Group ${colorIndex + 1}`, colorIndex)
    } else {
      fillWells([id], '', -1)
    }
  }, [wells, colorIndex, fillWells])

  const handleMouseEnter = useCallback((id: string) => {
    if (!isDraggingRef.current) return
    const well = wells.find((w) => w.id === id)!
    if (dragModeRef.current === 'fill' && !well.filled) {
      fillWells([id], `Group ${colorIndex + 1}`, colorIndex)
    } else if (dragModeRef.current === 'clear' && well.filled) {
      fillWells([id], '', -1)
    }
  }, [wells, colorIndex, fillWells])

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false
  }, [])

  const selectRow = (row: string) => {
    const ids = COLS.map((c) => `${row}${c}`)
    fillWells(ids, `Group ${colorIndex + 1}`, colorIndex)
  }

  const selectCol = (col: number) => {
    const ids = ROWS.map((r) => `${r}${col}`)
    fillWells(ids, `Group ${colorIndex + 1}`, colorIndex)
  }

  const fillAll = () => {
    const ids = wells.map((w) => w.id)
    fillWells(ids, `Group ${colorIndex + 1}`, colorIndex)
  }

  // Unique filled groups for legend
  const groups = Array.from(
    new Map(
      wells.filter((w) => w.filled).map((w) => [w.sampleName, w.groupColor])
    ).entries()
  )

  return (
    <div
      className="relative w-full h-full flex flex-col"
      style={{ background: '#050a0f', userSelect: 'none' }}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          borderBottom: '1px solid #1a2940',
          flexShrink: 0,
        }}
      >
        <div>
          <p style={{ fontSize: 10, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.2em', color: accentColor, marginBottom: 2 }}>
            Step 2 of 3 · {cfg?.name}
          </p>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'white', margin: 0 }}>
            Configure 96-Well Plate
          </h2>
        </div>

        {/* Run button — always visible in header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, fontFamily: 'monospace', color: canRun ? accentColor : '#334155' }}>
            {filledCount}/96 wells filled
          </span>

          <button
            onClick={() => setScreen('select')}
            style={{ fontSize: 11, color: '#475569', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'monospace' }}
          >
            ← Back
          </button>

          <button
            onClick={() => canRun && setScreen('animation')}
            disabled={!canRun}
            style={{
              padding: '9px 22px',
              fontSize: 13,
              fontWeight: 700,
              borderRadius: 999,
              border: `1px solid ${accentColor}${canRun ? 'aa' : '25'}`,
              background: canRun ? `${accentColor}25` : 'transparent',
              color: canRun ? accentColor : '#334155',
              cursor: canRun ? 'pointer' : 'not-allowed',
              boxShadow: canRun ? `0 0 16px ${accentColor}35` : 'none',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              if (canRun) {
                e.currentTarget.style.background = `${accentColor}40`
                e.currentTarget.style.boxShadow = `0 0 24px ${accentColor}55`
              }
            }}
            onMouseLeave={(e) => {
              if (canRun) {
                e.currentTarget.style.background = `${accentColor}25`
                e.currentTarget.style.boxShadow = `0 0 16px ${accentColor}35`
              }
            }}
          >
            {canRun ? 'Run Experiment →' : 'Fill wells to continue'}
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Plate */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', padding: 24 }}>
          <div>
            {/* Column headers */}
            <div style={{ display: 'flex', marginLeft: 30 }}>
              {COLS.map((col) => (
                <div
                  key={col}
                  onClick={() => selectCol(col)}
                  title={`Fill column ${col}`}
                  style={{
                    width: 44, height: 24,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', fontSize: 10, fontFamily: 'monospace', color: '#475569',
                  }}
                >
                  {col}
                </div>
              ))}
            </div>

            {/* Rows */}
            {ROWS.map((row) => (
              <div key={row} style={{ display: 'flex', alignItems: 'center', marginBottom: 3 }}>
                <div
                  onClick={() => selectRow(row)}
                  title={`Fill row ${row}`}
                  style={{
                    width: 30, height: 44,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', fontSize: 11, fontFamily: 'monospace', fontWeight: 600, color: '#475569',
                  }}
                >
                  {row}
                </div>

                {COLS.map((col) => {
                  const id = `${row}${col}`
                  const well = wells.find((w) => w.id === id)!
                  const filled = well.filled
                  return (
                    <div
                      key={id}
                      onMouseDown={() => handleMouseDown(id)}
                      onMouseEnter={() => handleMouseEnter(id)}
                      style={{ width: 44, height: 44, padding: 3, cursor: 'crosshair', flexShrink: 0 }}
                    >
                      <div
                        style={{
                          width: '100%', height: '100%',
                          borderRadius: '50%',
                          background: filled ? well.groupColor : '#0d1a2a',
                          border: `2px solid ${filled ? `${well.groupColor}cc` : '#1e3350'}`,
                          boxShadow: filled ? `0 0 8px ${well.groupColor}55` : 'none',
                          transition: 'background 0.08s, box-shadow 0.08s',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        {filled && (
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}

            <p style={{ marginTop: 10, marginLeft: 30, fontSize: 10, color: '#1e3350', fontFamily: 'monospace' }}>
              Click or drag to fill · Click row/col label to fill entire row or column
            </p>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div
          style={{
            width: 240,
            background: '#080f1a',
            borderLeft: '1px solid #1a2940',
            display: 'flex',
            flexDirection: 'column',
            padding: 16,
            gap: 16,
            overflowY: 'auto',
            flexShrink: 0,
          }}
        >
          {/* Color picker */}
          <div>
            <p style={{ fontSize: 9, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#475569', marginBottom: 8 }}>
              Active Color
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {GROUP_COLORS.map((color, i) => (
                <button
                  key={color}
                  onClick={() => setColorIndex(i)}
                  style={{
                    width: 26, height: 26,
                    borderRadius: '50%',
                    background: color,
                    border: colorIndex === i ? '2px solid white' : '2px solid transparent',
                    outline: colorIndex === i ? `2px solid ${color}` : 'none',
                    outlineOffset: 2,
                    cursor: 'pointer',
                    transform: colorIndex === i ? 'scale(1.2)' : 'scale(1)',
                    transition: 'transform 0.15s',
                    boxShadow: colorIndex === i ? `0 0 10px ${color}` : 'none',
                  }}
                />
              ))}
            </div>
            <p style={{ fontSize: 10, color: '#334155', marginTop: 6 }}>
              Selected color will be applied when you click or drag on wells
            </p>
          </div>

          {/* Quick actions */}
          <div>
            <p style={{ fontSize: 9, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#475569', marginBottom: 8 }}>
              Quick Fill
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button
                onClick={fillAll}
                style={{
                  padding: '7px 0', fontSize: 12, borderRadius: 6,
                  border: `1px solid ${accentColor}40`, background: `${accentColor}0d`,
                  color: accentColor, cursor: 'pointer',
                }}
              >
                Fill All 96 Wells
              </button>
              <button
                onClick={resetWells}
                style={{
                  padding: '7px 0', fontSize: 12, borderRadius: 6,
                  border: '1px solid #ef444430', background: 'transparent',
                  color: '#ef4444', cursor: 'pointer',
                }}
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Legend */}
          {groups.length > 0 && (
            <div>
              <p style={{ fontSize: 9, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#475569', marginBottom: 8 }}>
                Groups ({groups.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {groups.map(([name, color]) => {
                  const count = wells.filter((w) => w.filled && w.sampleName === name).length
                  return (
                    <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, boxShadow: `0 0 4px ${color}`, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 12, color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                      <span style={{ fontSize: 10, color: '#475569' }}>×{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
