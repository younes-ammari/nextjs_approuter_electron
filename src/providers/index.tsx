"use client";

import { Toaster } from '@/components/ui/sonner'
import { InventoryProvider } from '@/context/InventoryContext'
import React from 'react'

export default function Providers({
    children
}: { children: React.ReactNode }) {
    return (
        <InventoryProvider>
                {children}
            <Toaster position="top-right" />
        </InventoryProvider>
    )
}
