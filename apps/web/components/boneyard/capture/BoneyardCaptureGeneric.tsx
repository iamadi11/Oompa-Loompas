'use client'

import { Skeleton } from 'boneyard-js/react'
import { GenericWorkspaceFixture } from '../fixtures/GenericWorkspaceFixture'

export function BoneyardCaptureGeneric() {
  return (
    <div className="min-h-screen w-full bg-canvas">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <Skeleton
          name="workspace-generic"
          loading={false}
          className="block w-full min-h-[480px]"
          snapshotConfig={{ captureRoundedBorders: true }}
          fixture={<GenericWorkspaceFixture />}
        >
          <span className="sr-only">Capture</span>
        </Skeleton>
      </div>
    </div>
  )
}
