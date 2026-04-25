"use client";

import React, { ReactNode } from "react";
import { usePermissions } from "./PermissionsContext";

type Props = {
    children: ReactNode;
    anyOf?: string[]; // e.g. ["PERM_PEOPLE_VIEW", "PERM_ROLES_VIEW"]
    allOf?: string[];
    fallback?: ReactNode;
};

export const PermissionGate: React.FC<Props> = ({
    children,
    anyOf,
    allOf,
    fallback = null
}) => {
    const { can, loading } = usePermissions();

    if (loading) {
        // Optional: could render nothing or a spinner. 
        // Usually for buttons we might just wait or render disabled?
        // For now render nothing to be safe.
        return null;
    }

    let allowed = true;

    if (anyOf && anyOf.length > 0) {
        allowed = anyOf.some(p => can(p));
    }

    if (allowed && allOf && allOf.length > 0) {
        allowed = allOf.every(p => can(p));
    }

    if (!allowed) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};
