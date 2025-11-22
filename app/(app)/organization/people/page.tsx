import React from "react";
import PeopleTableContainer from "@/components/modules/organization/components/PeopleTableContainer/PeopleTableContainer";
import { Tabs } from "@/components/layout/Tabs";

const tabs = [
  { id: "people",  label: "Organisation Structure", href: `people` },
  { id: "chart", label: "People Chart", href: `chart` },
];

const OrganizationPeoplePage: React.FC = () => (
  <>
    <h1>Organisation</h1>
    <Tabs tabs={tabs} />
    <PeopleTableContainer/>
  </>
);

export default OrganizationPeoplePage;
