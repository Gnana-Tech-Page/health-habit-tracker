import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, getWeek } from 'date-fns'
import { HABIT_FIELDS, computeCompletion, computeSleepStatus } from './habitHelpers'

const BOOL_HABITS = HABIT_FIELDS.filter(f => f.type === 'bool' && f.key !== 'sleepOnTime')
const NUM_HABITS = HABIT_FIELDS.filter(f => f.type === 'number')
const ALL_DISPLAY = [...BOOL_HABITS, ...NUM_HABITS]

function entryVal(entry, key) {
  if (!entry) return ''
  const field = HABIT_FIELDS.find(f => f.key === key)
  if (!field) return entry[key] ?? ''
  if (field.type === 'bool') return entry[key] ? 'Y' : 'N'
  return entry[key] ?? 0
}

export function downloadWeeklyReport(userName, entries, referenceDate = new Date()) {
  const start = startOfWeek(referenceDate, { weekStartsOn: 1 })
  const end = endOfWeek(referenceDate, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start, end })
  const dateLabels = days.map(d => format(d, 'EEE dd MMM'))
  const dateKeys = days.map(d => format(d, 'yyyy-MM-dd'))

  const wb = XLSX.utils.book_new()

  // Sheet 1 - Weekly Log
  const header = ['Habit', 'Category', ...dateLabels]
  const rows = [header]
  ALL_DISPLAY.forEach(f => {
    const row = [f.label, f.category]
    dateKeys.forEach(dk => {
      const e = entries.find(x => x.date === dk)
      row.push(entryVal(e, f.key))
    })
    rows.push(row)
  })
  // Sleep row
  const sleepRow = ['Sleep Time', 'evening']
  dateKeys.forEach(dk => {
    const e = entries.find(x => x.date === dk)
    sleepRow.push(e?.sleepTime || '')
  })
  rows.push(sleepRow)

  const ws1 = XLSX.utils.aoa_to_sheet(rows)
  ws1['!cols'] = [{ wch: 22 }, { wch: 12 }, ...dateLabels.map(() => ({ wch: 14 }))]
  XLSX.utils.book_append_sheet(wb, ws1, 'Weekly Log')

  // Sheet 2 - Summary
  const summaryHeader = ['Date', 'Completion %', 'Sleep Time', 'On Time', 'Mins Late']
  const summaryRows = [summaryHeader]
  days.forEach((d, i) => {
    const dk = dateKeys[i]
    const e = entries.find(x => x.date === dk)
    const pct = e ? computeCompletion(e) : 0
    summaryRows.push([
      format(d, 'EEE dd MMM'),
      pct,
      e?.sleepTime || '',
      e?.sleepOnTime ? 'Yes' : 'No',
      e?.minsLate || 0,
    ])
  })
  const ws2 = XLSX.utils.aoa_to_sheet(summaryRows)
  XLSX.utils.book_append_sheet(wb, ws2, 'Summary')

  const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), `${userName}_weekly_${format(start,'yyyy-MM-dd')}.xlsx`)
}

export function downloadMonthlyReport(userName, entries, referenceDate = new Date()) {
  const start = startOfMonth(referenceDate)
  const end = endOfMonth(referenceDate)
  const days = eachDayOfInterval({ start, end })
  const dateKeys = days.map(d => format(d, 'yyyy-MM-dd'))
  const wb = XLSX.utils.book_new()

  // Sheet 1 - Monthly Log
  const header = ['Date', ...ALL_DISPLAY.map(f => f.label), 'Sleep Time', 'On Time', 'Completion %']
  const rows = [header]
  days.forEach((d, i) => {
    const dk = dateKeys[i]
    const e = entries.find(x => x.date === dk)
    const row = [format(d, 'EEE dd MMM')]
    ALL_DISPLAY.forEach(f => row.push(entryVal(e, f.key)))
    row.push(e?.sleepTime || '', e?.sleepOnTime ? 'Yes' : 'No', e ? computeCompletion(e) : 0)
    rows.push(row)
  })
  const ws1 = XLSX.utils.aoa_to_sheet(rows)
  ws1['!cols'] = [{ wch: 16 }, ...ALL_DISPLAY.map(() => ({ wch: 18 })), { wch: 12 }, { wch: 10 }, { wch: 14 }]
  XLSX.utils.book_append_sheet(wb, ws1, 'Monthly Log')

  // Sheet 2 - Weekly Rollup
  const weekMap = {}
  days.forEach((d, i) => {
    const wk = `Week ${getWeek(d, { weekStartsOn: 1 })}`
    if (!weekMap[wk]) weekMap[wk] = []
    const e = entries.find(x => x.date === dateKeys[i])
    if (e) weekMap[wk].push(e)
  })
  const wkHeader = ['Week', 'Days Logged', 'Avg Completion %', 'Avg Push Ups', 'Avg Squats', 'Avg Plank']
  const wkRows = [wkHeader]
  Object.entries(weekMap).forEach(([wk, wkEntries]) => {
    const avgPct = wkEntries.length ? Math.round(wkEntries.reduce((s, e) => s + computeCompletion(e), 0) / wkEntries.length) : 0
    const avg = (key) => wkEntries.length ? Math.round(wkEntries.reduce((s, e) => s + (e[key] || 0), 0) / wkEntries.length) : 0
    wkRows.push([wk, wkEntries.length, avgPct, avg('pushUps'), avg('squats'), avg('plank')])
  })
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(wkRows), 'Weekly Rollup')

  // Sheet 3 - Sleep Analysis
  const sleepHeader = ['Date', 'Sleep Time', 'On Time', 'Mins Late']
  const sleepRows = [sleepHeader, ...days.map((d, i) => {
    const e = entries.find(x => x.date === dateKeys[i])
    return [format(d, 'EEE dd MMM'), e?.sleepTime || '', e?.sleepOnTime ? 'Yes' : 'No', e?.minsLate || 0]
  })]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sleepRows), 'Sleep Analysis')

  // Sheet 4 - Summary Stats
  const statHeader = ['Habit', 'Days Done', 'Days Missed', '% Completion', 'Target 85%']
  const statRows = [statHeader]
  const logged = days.filter((_, i) => entries.find(x => x.date === dateKeys[i]))
  ALL_DISPLAY.forEach(f => {
    const done = logged.filter((_, i) => {
      const e = entries.find(x => x.date === dateKeys[i])
      if (f.type === 'bool') return e?.[f.key]
      return (e?.[f.key] || 0) > 0
    }).length
    const total = logged.length
    const pct = total ? Math.round((done / total) * 100) : 0
    statRows.push([f.label, done, total - done, pct + '%', pct >= 85 ? '✓' : '✗'])
  })
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(statRows), 'Summary Stats')

  const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), `${userName}_monthly_${format(start,'yyyy-MM')}.xlsx`)
}
