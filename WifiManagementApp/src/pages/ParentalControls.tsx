import { useState } from 'react'
import { ChevronDown, ChevronUp, Plus, X, Clock, Search, Pause, Play } from 'lucide-react'
import { familyMembers as initialFamilyMembers, FamilyMember } from '../data/mockData'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-6 rounded-full transition-colors ${
        checked ? 'bg-[#00d4aa]' : 'bg-[#2a2a3e]'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

function MemberCard({ member, onUpdate }: { member: FamilyMember; onUpdate: (m: FamilyMember) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [newSite, setNewSite] = useState('')

  const addSite = () => {
    if (newSite.trim()) {
      onUpdate({ ...member, blockedSites: [...member.blockedSites, newSite.trim()] })
      setNewSite('')
    }
  }

  const removeSite = (site: string) => {
    onUpdate({ ...member, blockedSites: member.blockedSites.filter((s) => s !== site) })
  }

  const updateScheduleDay = (day: string, field: 'start' | 'end', value: string) => {
    const current = member.schedule[day] || { start: '00:00', end: '23:59' }
    onUpdate({
      ...member,
      schedule: { ...member.schedule, [day]: { ...current, [field]: value } },
    })
  }

  const toggleDay = (day: string) => {
    const hasSchedule = member.schedule[day] !== null
    onUpdate({
      ...member,
      schedule: {
        ...member.schedule,
        [day]: hasSchedule ? null : { start: '07:00', end: '22:00' },
      },
    })
  }

  return (
    <div className={`bg-[#1e1e2e] rounded-2xl border transition-all ${
      member.paused ? 'border-yellow-500/30' : 'border-[#2a2a3e]'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#252535] flex items-center justify-center text-xl">
            {member.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">{member.name}</span>
              {member.paused && (
                <span className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 text-xs">Paused</span>
              )}
            </div>
            <div className="text-[#94a3b8] text-xs mt-0.5">{member.devices.length} device(s) assigned</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdate({ ...member, paused: !member.paused })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              member.paused
                ? 'text-[#00d4aa] border-[#00d4aa]/30 hover:bg-[#00d4aa]/10'
                : 'text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10'
            }`}
          >
            {member.paused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            {member.paused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg hover:bg-[#252535] text-[#94a3b8] transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[#2a2a3e] p-4 space-y-5">
          {/* Safe Search */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[#94a3b8]" />
              <div>
                <div className="text-sm text-white font-medium">Safe Search</div>
                <div className="text-xs text-[#94a3b8]">Filter adult content from search results</div>
              </div>
            </div>
            <Toggle
              checked={member.safeSearch}
              onChange={(v) => onUpdate({ ...member, safeSearch: v })}
            />
          </div>

          {/* Blocked sites */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <X className="w-4 h-4 text-[#94a3b8]" />
              <span className="text-sm text-white font-medium">Blocked Sites</span>
            </div>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSite}
                onChange={(e) => setNewSite(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSite()}
                placeholder="e.g. instagram.com"
                className="flex-1 px-3 py-2 rounded-xl bg-[#252535] border border-[#2a2a3e] text-white text-sm placeholder-[#94a3b8] focus:outline-none focus:border-[#00d4aa]/50"
              />
              <button
                onClick={addSite}
                className="px-3 py-2 rounded-xl bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/30 hover:bg-[#00d4aa]/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {member.blockedSites.map((site) => (
                <div
                  key={site}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
                >
                  {site}
                  <button onClick={() => removeSite(site)} className="hover:text-red-300">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-[#94a3b8]" />
              <span className="text-sm text-white font-medium">Internet Schedule</span>
            </div>
            <div className="space-y-2">
              {DAYS.map((day) => {
                const hasSchedule = member.schedule[day] !== null
                const sched = member.schedule[day]
                return (
                  <div key={day} className="flex items-center gap-3">
                    <button
                      onClick={() => toggleDay(day)}
                      className={`w-10 text-xs font-medium rounded-lg px-1.5 py-1 border transition-colors ${
                        hasSchedule
                          ? 'bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/30'
                          : 'bg-[#252535] text-[#94a3b8] border-[#2a2a3e]'
                      }`}
                    >
                      {day}
                    </button>
                    {hasSchedule && sched ? (
                      <div className="flex items-center gap-2 text-xs">
                        <input
                          type="time"
                          value={sched.start}
                          onChange={(e) => updateScheduleDay(day, 'start', e.target.value)}
                          className="px-2 py-1 rounded-lg bg-[#252535] border border-[#2a2a3e] text-white text-xs focus:outline-none focus:border-[#00d4aa]/50"
                        />
                        <span className="text-[#94a3b8]">to</span>
                        <input
                          type="time"
                          value={sched.end}
                          onChange={(e) => updateScheduleDay(day, 'end', e.target.value)}
                          className="px-2 py-1 rounded-lg bg-[#252535] border border-[#2a2a3e] text-white text-xs focus:outline-none focus:border-[#00d4aa]/50"
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-[#94a3b8]">Blocked all day</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ParentalControls() {
  const [members, setMembers] = useState(initialFamilyMembers)

  const updateMember = (updated: FamilyMember) => {
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="bg-[#1e1e2e] rounded-2xl border border-[#2a2a3e] p-4 flex items-center justify-between">
        <div>
          <div className="text-white font-semibold">Family Profiles</div>
          <div className="text-[#94a3b8] text-xs mt-0.5">{members.length} profiles · click to expand</div>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#00d4aa]/10 text-[#00d4aa] text-sm font-medium border border-[#00d4aa]/30 hover:bg-[#00d4aa]/20 transition-colors">
          <Plus className="w-4 h-4" />
          Add Profile
        </button>
      </div>

      {members.map((member) => (
        <MemberCard key={member.id} member={member} onUpdate={updateMember} />
      ))}
    </div>
  )
}
