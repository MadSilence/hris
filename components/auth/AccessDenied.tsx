"use client";
import React from "react";
import Link from "next/link";

export const AccessDenied: React.FC<{ message?: string }> = ({ message = "You do not have permission to view this page." }) => {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            padding: "2rem",
            textAlign: "center"
        }}>
            <h1 style={{ fontSize: "2rem", marginBottom: "1rem", color: "#e11d48" }}>Access Denied</h1>
            <p style={{ marginBottom: "2rem", color: "#64748b" }}>{message}</p>
            <Link href="/" style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#2563eb",
                color: "white",
                borderRadius: "0.375rem",
                textDecoration: "none"
            }}>
                Return Home
            </Link>
        </div>
    );
};
