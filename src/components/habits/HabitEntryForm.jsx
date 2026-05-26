import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Sunrise, Dumbbell, Salad, Brain, Moon, Check, Loader2, AlertCircle } from 'lucide-react'
import Card from '../ui/Card'
import HabitToggle from './HabitToggle'
import NumberStepper from './NumberStepper'
import SleepInput from './SleepInput'
import { useHabits } from '../../context/HabitContext'

const DEFAULT = {
  wakeUpTime: '', drinkLemonWater: false, eatMethi: false, morningWalk: false,
  pushUps: 0, squats: 0, plank: 0, eatingNuts: false, drink3LWater: false,
  writing: false, meditation: false, read10Pages: false, learning: false, sleepTime: '',
}

function SaveIndicator({ status }) {
  if (status === 'saving') return (
    <span className="flex items-center gap-1 text-xs text-slate-400">
      <Loader2 size={12} className="animate-spin"/> Saving…
    </span>
  )
  if (status === 'saved') return (
    <span className="flex items-center gap-1 text-xs text-brand-500">
      <Check size={12}/> Saved
    </span>
  )
  if (status === 'error') return (
    <span className="flex items-center gap-1 text-xs text-red-400">
      <AlertCircle size={12}/> Save failed
    </span>
  )
  return null
}

export default function HabitEntryForm() {
  const { todayEntry, saveEntry, saveStatus } = useHabits()
  const [form, setForm] = useState({ ...DEFAULT, date: format(new Date(), 'yyyy-MM-dd') })

  useEffect(() => { if (todayEntry) setForm({ ...DEFAULT, ...todayEntry }) }, [todayEntry])

  function update(field, value) {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      saveEntry(next)
      return next
    })
  }

  const cardBorder = { morning: 'border-t-amber-500', fitness: 'border-t-brand-500', nutrition: 'border-t-emerald-500', mind: 'border-t-violet-500', evening: 'border-t-indigo-500' }

  const sections = [
    {
      icon: <Sunrise size={15} className="text-amber-400"/>, title: 'Morning', key: 'morning',
      content: (
        <div className="space-y-1">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-slate-300">Wake Up Time</span>
            <input type="time" value={form.wakeUpTime} onChange={e => update('wakeUpTime', e.target.value)}
              className="bg-slate-700 border border-slate-600 text-slate-100 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 [color-scheme:dark]" />
          </div>
          <HabitToggle label="Drink Lemon Water" checked={form.drinkLemonWater} onChange={v => update('drinkLemonWater', v)} />
          <HabitToggle label="Eat Methi" checked={form.eatMethi} onChange={v => update('eatMethi', v)} />
        </div>
      )
    },
    {
      icon: <Dumbbell size={15} className="text-brand-500"/>, title: 'Fitness', key: 'fitness',
      content: (
        <div className="space-y-1">
          <HabitToggle label="Morning Walk / Workout" checked={form.morningWalk} onChange={v => update('morningWalk', v)} />
          <NumberStepper label="Push Ups" value={form.pushUps} onChange={v => update('pushUps', v)} unit="reps" />
          <NumberStepper label="Squats"   value={form.squats}  onChange={v => update('squats',  v)} unit="reps" />
          <NumberStepper label="Plank"    value={form.plank}   onChange={v => update('plank',   v)} unit="sec"  />
        </div>
      )
    },
    {
      icon: <Salad size={15} className="text-emerald-400"/>, title: 'Nutrition', key: 'nutrition',
      content: (
        <div className="space-y-1">
          <HabitToggle label="Eating Nuts" checked={form.eatingNuts} onChange={v => update('eatingNuts', v)} />
          <HabitToggle label="Drink 3L Water" checked={form.drink3LWater} onChange={v => update('drink3LWater', v)} />
        </div>
      )
    },
    {
      icon: <Brain size={15} className="text-violet-400"/>, title: 'Mind', key: 'mind',
      content: (
        <div className="space-y-1">
          <HabitToggle label="Writing" checked={form.writing} onChange={v => update('writing', v)} />
          <HabitToggle label="Meditation" checked={form.meditation} onChange={v => update('meditation', v)} />
          <HabitToggle label="Read 10 Pages" checked={form.read10Pages} onChange={v => update('read10Pages', v)} />
          <HabitToggle label="Learning" checked={form.learning} onChange={v => update('learning', v)} />
        </div>
      )
    },
    {
      icon: <Moon size={15} className="text-indigo-400"/>, title: 'Evening', key: 'evening',
      content: <SleepInput value={form.sleepTime} onChange={v => update('sleepTime', v)} />
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-semibold text-white text-lg">Today's Habits</h2>
        <div className="flex items-center gap-3">
          <SaveIndicator status={saveStatus} />
          <span className="section-label">{format(new Date(), 'EEE, dd MMM yyyy')}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {sections.map(s => (
          <Card key={s.title} className={`p-5 border-t-4 ${cardBorder[s.key]}`}>
            <div className="flex items-center gap-2 mb-3">
              {s.icon}
              <span className="section-label">{s.title}</span>
            </div>
            {s.content}
          </Card>
        ))}
      </div>
    </div>
  )
}
