'use client'

import { Skeleton } from 'boneyard-js/react'
import { DashboardFixture } from '../fixtures/DashboardFixture'

export function BoneyardCaptureDashboard() {
  return (
    <div className="min-h-screen w-full bg-canvas">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <Skeleton
          name="workspace-dashboard"
          loading={false}
          className="block w-full min-h-[560px]"
          snapshotConfig={{ captureRoundedBorders: true }}
          fixture={<DashboardFixture />}
        >
          <span className="sr-only">Capture</span>
        </Skeleton>
      </div>
    </div>
  )
}
