import { useEffect, useState } from 'react'
import { useQuery, useSubscription } from '@apollo/client'
import {
  CONNECTIONS_CHANGED_SUBSCRIPTION,
  CONNECTIONS_STATUS_QUERY,
} from '../graphql/connections'

export function ConnectionsDashboardPage() {
  const { data, loading, error } = useQuery<{ connectionsStatus: { count: number } }>(
    CONNECTIONS_STATUS_QUERY,
  )
  const [count, setCount] = useState<number>()

  useEffect(() => {
    if (data?.connectionsStatus) setCount(data.connectionsStatus.count)
  }, [data?.connectionsStatus])

  // `ConnectionsStatusType` has no `id` field, so unlike Post it won't
  // normalize/merge across the query and subscription automatically —
  // update local state explicitly from each subscription payload instead.
  useSubscription<{ connectionsChanged: { count: number } }>(
    CONNECTIONS_CHANGED_SUBSCRIPTION,
    {
      onData: ({ data: subData }) => {
        const next = subData.data?.connectionsChanged.count
        if (next !== undefined) setCount(next)
      },
    },
  )

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>
  if (error)
    return <p className="text-sm text-destructive">Could not reach the backend.</p>

  return (
    <div className="w-full max-w-md space-y-2 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Connections dashboard
      </h1>
      <p className="text-sm text-muted-foreground">
        Live websocket connections to this backend instance
      </p>
      <p className="text-6xl font-bold tabular-nums text-primary">{count}</p>
    </div>
  )
}
