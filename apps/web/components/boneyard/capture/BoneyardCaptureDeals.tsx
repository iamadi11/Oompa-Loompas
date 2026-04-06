'use client'

import { Skeleton } from 'boneyard-js/react'
import { DealsFixture } from '@/components/boneyard/fixtures/DealsFixture'

export function BoneyardCaptureDeals() {
  return (
    <div className="min-h-screen w-full bg-canvas">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <Skeleton
          name="workspace-deals"
          loading={false}
          className="block w-full min-h-[560px]"
          snapshotConfig={{ captureRoundedBorders: true }}
          fixture={<DealsFixture />}
        >
          <span className="sr-only">Capture</span>
        </Skeleton>
      </div>
    </div>
  )
}
