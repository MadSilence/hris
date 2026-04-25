import React from "react";
import { Office } from "@/models/office";

export type OfficeDetailsViewProps = {
  office: Office;
};

export const OfficeDetailsView: React.FC<OfficeDetailsViewProps> = ({ office }) => {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4">
        <h3 className="text-sm font-medium">Office details</h3>

        <div className="grid gap-2">
          <span className="text-sm text-muted-foreground">Name</span>
          <div className="rounded-md bg-muted px-3 py-2">{office.name}</div>
        </div>

        <div className="grid gap-2">
          <span className="text-sm text-muted-foreground">Description</span>
          <div className="rounded-md bg-muted px-3 py-2 whitespace-pre-wrap">
            {office.description}
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <h3 className="text-sm font-medium">Contacts</h3>

        <div className="grid gap-2">
          <span className="text-sm text-muted-foreground">Email</span>
          <div className="rounded-md bg-muted px-3 py-2">{office.email}</div>
        </div>

        <div className="grid gap-2">
          <span className="text-sm text-muted-foreground">Phone</span>
          <div className="rounded-md bg-muted px-3 py-2">{office.phone}</div>
        </div>
      </div>

      <div className="grid gap-4">
        <h3 className="text-sm font-medium">Address</h3>

        <div className="grid gap-2">
          <span className="text-sm text-muted-foreground">Country</span>
          <div className="rounded-md bg-muted px-3 py-2">{office.country}</div>
        </div>

        <div className="grid gap-2">
          <span className="text-sm text-muted-foreground">City</span>
          <div className="rounded-md bg-muted px-3 py-2">{office.city}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <span className="text-sm text-muted-foreground">Street</span>
            <div className="rounded-md bg-muted px-3 py-2">{office.street}</div>
          </div>
          <div className="grid gap-2">
            <span className="text-sm text-muted-foreground">Building</span>
            <div className="rounded-md bg-muted px-3 py-2">{office.building}</div>
          </div>
        </div>

        <div className="grid gap-2">
          <span className="text-sm text-muted-foreground">Post code</span>
          <div className="rounded-md bg-muted px-3 py-2">{office.postCode}</div>
        </div>
      </div>
    </div>
  );
};
