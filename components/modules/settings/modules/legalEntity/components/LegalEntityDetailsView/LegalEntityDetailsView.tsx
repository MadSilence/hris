import React from "react";
import { LegalEntity } from "@/models/legalEntity";


export type LegalEntityDetailsViewProps = {
  legalEntity: LegalEntity
}

export const LegalEntityDetailsView: React.FC<LegalEntityDetailsViewProps> = ({
  legalEntity
}) => {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4">
        <h3 className="text-sm font-medium">Legal entity details</h3>

        <div className="grid gap-2">
          <span className="text-sm text-muted-foreground">Name</span>
          <div className="rounded-md bg-muted px-3 py-2">{legalEntity.name}</div>
        </div>

        <div className="grid gap-2">
          <span className="text-sm text-muted-foreground">Description</span>
          <div className="rounded-md bg-muted px-3 py-2 whitespace-pre-wrap">
            {legalEntity.description}
          </div>
        </div>

        <div className="grid gap-2">
          <span className="text-sm text-muted-foreground">Registration number</span>
          <div className="rounded-md bg-muted px-3 py-2">
            {legalEntity.registrationNumber}
          </div>
        </div>

        <div className="grid gap-2">
          <span className="text-sm text-muted-foreground">Tax ID</span>
          <div className="rounded-md bg-muted px-3 py-2">{legalEntity.taxId}</div>
        </div>
      </div>

      <div className="grid gap-4">
        <h3 className="text-sm font-medium">Address</h3>

        <div className="grid gap-2">
          <span className="text-sm text-muted-foreground">Country</span>
          <div className="rounded-md bg-muted px-3 py-2">{legalEntity.country}</div>
        </div>

        <div className="grid gap-2">
          <span className="text-sm text-muted-foreground">City</span>
          <div className="rounded-md bg-muted px-3 py-2">{legalEntity.city}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <span className="text-sm text-muted-foreground">Street</span>
            <div className="rounded-md bg-muted px-3 py-2">{legalEntity.street}</div>
          </div>
          <div className="grid gap-2">
            <span className="text-sm text-muted-foreground">Building</span>
            <div className="rounded-md bg-muted px-3 py-2">{legalEntity.building}</div>
          </div>
        </div>

        <div className="grid gap-2">
          <span className="text-sm text-muted-foreground">Post code</span>
          <div className="rounded-md bg-muted px-3 py-2">{legalEntity.postCode}</div>
        </div>
      </div>
    </div>
  );
};
