import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { Sunrise, Dumbbell, Salad, Brain, Moon } from 'lucide-react'
import Card from '../ui/Card'
import HabitToggle from './HabitToggle'
import NumberStepper from './NumberStepper'
import SleepInput from './SleepInput'
import { useHabits } from '../../context/HabitContext'
import { useToast } from '../ui/Toast'

const DEFAULT_ENTRY = {
  wakeUpTime: '',
  drinkLemonWater: false,
  eatMethi: false,
  morningWalk: false,
  pushUps: 0,
  squats: 0,
  plank: 0,
  eatingNuts: false,
  drink3LWater: false,
  writing: false,
  meditation: false,
  read10Pages: false,
  learning: false,
  sleepTime: '',
}

export default function HabitEntryForm() {
  const { todayEntry, saveEntry } = useHabits()
  const { addToast } = useToast()
  const [form, setForm] = useState({ ...DEFAULT_ENTRY, date: format(new Date(), 'yyyy-MM-dd') })
  const debounceRef = useRef(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (todayEntry) setForm({ ...DEFAULT_ENTRY, ...todayEntry })
    initialized.current = true
  }, [todayEntry])

  function update(field, value) {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        saveEntry(next)
        addToast('✓ Saved')
      }, 500)
      return next
    })
  }

  const sections = [
    {
      icon: <Sunrise size={16} className="text-amber-400" />,
      title: 'Morning',
      color: 'border-amber-100',
      content: (
        <div className="space-y-1">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-gray-700">Wake Up Time</span>
            <input type="time" value={form.wakeUpTime} onChange={e => update('wakeUpTime', e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-navy focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <HabitToggle label="Drink Lemon Water" checked={form.drinkLemonWater} onChange={v => update('drinkLemonWater', v)} />
          <HabitToggle label="Eat Methi" checked={form.eatMethi} onChange={v => update('eatMethi', v)} />
        </div>
      )
    },
    {
      icon: <Dumbbell size={16} className="text-brand-500" />,
      title: 'Fitness',
      color: 'border-brand-100',
      content: (
        <div className="space-y-1">
          <HabitToggle label="Morning Walk / Workout" checked={form.morningWalk} onChange={v => update('morningWalk', v)} />
          <NumberStepper label="Push Ups" value={form.pushUps} onChange={v => update('pushUps', v)} unit="reps" step={5} />
          <NumberStepper label="Squats" value={form.squats} onChange={v => update('squats', v)} unit="reps" step={5} />
          <NumberStepper label="Plank" value={form.plank} onChange={v => update('plank', v)} unit="sec" step={10} />
        </div>
      )
    },
    {
      icon: <Salad size={16} className="text-green-500" />,
      title: 'Nutrition',
      color: 'border-green-100',
      content: (
        <div className="space-y-1">
          <HabitToggle label="Eating Nuts" checked={form.eatingNuts} onChange={v => update('eatingNuts', v)} />
          <HabitToggle label="Drink 3L Water" checked={form.drink3LWater} onChange={v => update('drink3LWater', v)} />
        </div>
      )
    },
    {
      icon: <Brain size={16} className="text-indigo-500" />,
      title: 'Mind',
      color: 'border-indigo-100',
      content: (
        <div className="space-y-1">
          <HabitToggle label="Writing" checked={form.writing} onChange={v => update('writing', v)} />
          <HabitToggle label="Meditation / Mindfulness" checked={form.meditation} onChange={v => update('meditation', v)} />
          <HabitToggle label="Read 10 Pages" checked={form.read10Pages} onChange={v => update('read10Pages', v)} />
          <HabitToggle label="Learning / Skill Improvement" checked={form.learning} onChange={v => update('learning', v)} />
        </div>
      )
    },
    {
      icon: <Moon size={16} className="text-purple-500" />,
      title: 'Evening',
      color: 'border-purple-100',
      content: <SleepInput value={form.sleepTime} onChange={v => update('sleepTime', v)} />
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-semibold text-navy text-lg">Today's Habits</h2>
        <span className="text-xs text-gray-400 uppercase tracking-widest">{format(new Date(), 'EEE, dd MMM yyyy')}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {sections.map(s => (
          <Card key={s.title} className={`p-5 border-t-4 ${s.color}`}>
            <div className="flex items-center gap-2 mb-3">
              {s.icon}
              <span className="uppercase tracking-widest text-xs font-semibold text-gray-400">{s.title}</span>
            </div>
            {s.content}
          </Card>
        ))}
      </div>
    </div>
  )
}
