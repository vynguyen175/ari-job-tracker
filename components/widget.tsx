'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Briefcase, Loader2, AlertCircle, TrendingUp } from 'lucide-react'

interface PipelineStats {
  total: number
  saved: number
  applied: number
  interviewing: number
  offers: number
  rejected: number
}

export function JobTrackerWidget() {
  const [stats, setStats] = useState<PipelineStats>({ total: 0, saved: 0, applied: 0, interviewing: 0, offers: 0, rejected: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(false)
      const res = await fetch('/api/modules/job-tracker/applications')
      if (!res.ok) throw new Error('Failed to load')
      const apps = await res.json()

      setStats({
        total: apps.length,
        saved: apps.filter((a: any) => a.status === 'saved').length,
        applied: apps.filter((a: any) => a.status === 'applied').length,
        interviewing: apps.filter((a: any) => ['phone_screen', 'technical_interview', 'final_round'].includes(a.status)).length,
        offers: apps.filter((a: any) => a.status === 'offer').length,
        rejected: apps.filter((a: any) => a.status === 'rejected').length,
      })
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Job Tracker</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Job Tracker</CardTitle>
          <AlertCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-xs text-red-600">Failed to load data</div>
          <Button variant="ghost" size="sm" onClick={loadStats} className="w-full mt-2 text-xs">Retry</Button>
        </CardContent>
      </Card>
    )
  }

  const responseRate = stats.total > 0
    ? Math.round(((stats.interviewing + stats.offers) / stats.total) * 100)
    : 0

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Job Tracker</CardTitle>
        <Briefcase className="h-4 w-4 text-blue-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-medium">{stats.total}</div>
        <p className="text-xs text-muted-foreground">applications in pipeline</p>

        <div className="mt-3 pt-3 border-t space-y-2">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Applied
            </span>
            <span className="font-medium">{stats.applied}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Interviewing
            </span>
            <span className="font-medium">{stats.interviewing}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Offers
            </span>
            <span className="font-medium">{stats.offers}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 text-gray-400" />
              Response Rate
            </span>
            <span className="font-medium">{responseRate}%</span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-3 text-xs"
          onClick={() => window.location.href = '/job-tracker'}
        >
          <Briefcase className="w-3 h-3 mr-1" />
          View Pipeline
        </Button>
      </CardContent>
    </Card>
  )
}

export default JobTrackerWidget
