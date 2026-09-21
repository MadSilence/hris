"use client";

import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { showError } from "@/lib/errors/errorToast";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Pencil, Play, Trash2, Users } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/public/desact/src/components/ui/tabs";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";

import { PolicyOverview } from "./PolicyOverview";
import { PolicyAssignmentsTab } from "./PolicyAssignmentsTab";
import { DeleteTimeOffPolicyModal } from "../modals/DeleteTimeOffPolicyModal";
import {
  PolicyWizardModal,
  buildAccrualRequest,
  buildApprovalRequest,
  buildRestrictionsRequest,
  buildEditRulesRequest,
  buildEligibilityRequest,
  buildRequestRulesRequest,
  buildTenureRulesRequest,
  buildUpdatePolicyRequest,
  policyToWizardValues,
  type PolicyWizardValues,
} from "../wizard";

import { useTimeOffPolicy } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useTimeOffPolicy";
import { useSaveTimeOffPolicy } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useSaveTimeOffPolicy";
import { useActivateTimeOffPolicy } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useActivateTimeOffPolicy";
import { useArchiveTimeOffPolicy } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useArchiveTimeOffPolicy";
import { useDeleteTimeOffPolicy } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useDeleteTimeOffPolicy";
import { useTimeOffPolicyRequestRules } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyRequestRules/hooks/useTimeOffPolicyRequestRules";
import { useTimeOffPolicyEditRules } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyEditRules/hooks/useTimeOffPolicyEditRules";
import { useTimeOffPolicyApprovalSettings } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyApprovalSettings/hooks/useTimeOffPolicyApprovalSettings";
import { useTimeOffPolicyEligibility } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyEligibility/hooks/useTimeOffPolicyEligibility";
import { useTimeOffPolicyEditImpact } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useTimeOffPolicyEditImpact";
import { useTimeOffPolicyRestrictions } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyRestrictions/hooks/useTimeOffPolicyRestrictions";
import { useTimeOffPolicyAccrual } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyAccrual/hooks/useTimeOffPolicyAccrual";
import { useTimeOffPolicyTenureRules } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyTenureRules/hooks/useTimeOffPolicyTenureRules";
import { useLeaveType } from "@/components/modules/settings/modules/time/timeOff/leaveTypes/hooks/useLeaveType";

import { TimeOffPolicyStatus } from "@/api/modules/timeOff/timeOffPolicies/dto";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { ForbiddenError } from "@/components/clients/exceptions";
import { StatusBadge, type EntityStatus } from "@/components/ui/StatusBadge";

type Props = {
  leaveTypeId: string;
  policyId: string;
};

const policyStatus = (status: TimeOffPolicyStatus): EntityStatus => {
  switch (status) {
    case TimeOffPolicyStatus.Active:
      return "active";
    case TimeOffPolicyStatus.Archived:
      return "archived";
    default:
      return "draft";
  }
};

export default function PolicyDetailContainer({ leaveTypeId, policyId }: Props) {
  const router = useRouter();
  const listHref = `/settings/time/leave-type/${leaveTypeId}/policies`;

  const { data: policy, isLoading, error } = useTimeOffPolicy({ policyId });
  const { data: leaveType } = useLeaveType(leaveTypeId);

  const requestRulesQuery = useTimeOffPolicyRequestRules(policyId);
  const editRulesQuery = useTimeOffPolicyEditRules(policyId);
  const approvalQuery = useTimeOffPolicyApprovalSettings({ policyId });
  const eligibilityQuery = useTimeOffPolicyEligibility(policyId);
  const accrualQuery = useTimeOffPolicyAccrual(policyId);
  const restrictionsQuery = useTimeOffPolicyRestrictions(policyId);
  const tenureRulesQuery = useTimeOffPolicyTenureRules(policyId);

  // One mutation for the whole policy. The per-section hooks still exist and are still what a
  // screen editing one section on its own would use; the wizard edits all of them at once.
  const saveMutation = useSaveTimeOffPolicy();
  const activateMutation = useActivateTimeOffPolicy();
  const archiveMutation = useArchiveTimeOffPolicy();
  const deleteMutation = useDeleteTimeOffPolicy();

  const [isEditOpen, setIsEditOpen] = useState(false);
  // Asked while the editor is open, so the count is on the Review step before the save.
  const editImpactQuery = useTimeOffPolicyEditImpact(policyId, isEditOpen);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const editInitialValues = useMemo(() => {
    if (
      !policy ||
      !requestRulesQuery.data ||
      !editRulesQuery.data ||
      !approvalQuery.data ||
      !eligibilityQuery.data ||
      !accrualQuery.data ||
      !restrictionsQuery.data ||
      !tenureRulesQuery.data
    ) {
      return undefined;
    }
    return policyToWizardValues(
      policy,
      requestRulesQuery.data,
      editRulesQuery.data,
      approvalQuery.data,
      eligibilityQuery.data,
      accrualQuery.data,
      restrictionsQuery.data,
      tenureRulesQuery.data,
    );
  }, [
    policy,
    requestRulesQuery.data,
    editRulesQuery.data,
    approvalQuery.data,
    eligibilityQuery.data,
    accrualQuery.data,
    restrictionsQuery.data,
    tenureRulesQuery.data,
  ]);

  /**
   * One call, one transaction.
   *
   * This used to be ten `mutateAsync` calls in a row — rename, policy, request rules, edit rules,
   * eligibility, coverage, accrual, blackouts, tenure rules, approval. A refusal on the seventh left
   * the first six written and the last three not, in a state nobody chose and no screen could
   * describe. The sections are unchanged; only who owns the transaction is.
   */
  const handleEditSave = async (values: PolicyWizardValues) => {
    if (!policy) return;
    const id = policy.id;

    const newSlug = values.name.trim().toLowerCase().replace(/\s+/g, "-");

    await saveMutation.mutateAsync({
      id,
      name: newSlug !== policy.name ? newSlug : null,
      policy: buildUpdatePolicyRequest(values),
      requestRules: buildRequestRulesRequest(values),
      editRules: buildEditRulesRequest(values),
      eligibility: buildEligibilityRequest(values),
      accrual: buildAccrualRequest(values),
      restrictions: buildRestrictionsRequest(values),
      tenureRules: buildTenureRulesRequest(values),
      approval: buildApprovalRequest(values),
      // The version the wizard was filled from. A colleague's save since then is refused (E00409):
      // the wizard stays open with the message, and nothing of theirs is overwritten.
      version: values.version,
    });

    setIsEditOpen(false);
  };

  /** A refused save leaves the policy untouched now, but the person still has to be told why. */
  const handleEditSaveSafely = async (values: PolicyWizardValues) => {
    try {
      await handleEditSave(values);
    } catch (error) {
      showError(error);
    }
  };

  const handleDelete = async () => {
    if (!policy) return;
    try {
      await deleteMutation.mutateAsync({ id: policy.id });
      setIsDeleteOpen(false);
      router.push(listHref);
    } catch (error) {
      // Deleting an active policy is refused by the backend; the dialog stays open and now has
      // somewhere to print the reason, which is what made TIME_OFF_POLICY_IN_USE invisible.
      setDeleteError(error instanceof Error ? error.message : "The policy could not be deleted.");
    }
  };

  // Below the hooks: an early return above them would render fewer hooks than the previous pass.
  // Below every hook on purpose: an early return above them would change how many hooks
  // this render calls. A failed read is still an answer, so it gets a region, not a crash.
  if (error instanceof ForbiddenError) return <AccessDenied/>;
  if (error) return <ErrorState error={error} />;

  if (isLoading || !policy) {
    return (
      <div className="px-8 pt-2">
        <SettingsPageHeader title="Policy" backHref={listHref} />
        <Skeleton className="mt-6 h-40 w-full rounded-lg" />
      </div>
    );
  }

  const status = policyStatus(policy.status);
  const isArchived = policy.status === TimeOffPolicyStatus.Archived;
  const isDraft = policy.status === TimeOffPolicyStatus.Draft;

  return (
    <div className="flex h-[calc(100svh-6rem)] flex-col overflow-hidden">
      <div className="shrink-0 px-8 pt-2">
        <SettingsPageHeader title={policy.displayName} backHref={listHref} />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
          <div className="flex items-center gap-2.5">
            <StatusBadge status={status}/>
            {leaveType && (
              <span className="text-sm text-muted-foreground">in {leaveType.name}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isDraft && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => activateMutation.mutate({ id: policy.id })}
              >
                <Play className="h-4 w-4" />
                Activate
              </Button>
            )}
            {policy.status === TimeOffPolicyStatus.Active && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => archiveMutation.mutateAsync({ id: policy.id }).catch(showError)}
              >
                <Archive className="h-4 w-4" />
                Archive
              </Button>
            )}
            {isDraft && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-danger-600 hover:text-danger-700"
                onClick={() => setIsDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
            {!isArchived && (
              <Button size="sm" className="gap-1.5" onClick={() => setIsEditOpen(true)}>
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="flex min-h-0 flex-1 flex-col px-8 pt-5">
        <TabsList className="flex-none">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assignments" className="gap-1.5">
            <Users className="h-4 w-4" />
            Assignments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-5 min-h-0 flex-1 overflow-y-auto pb-6">
          <PolicyOverview policy={policy} />
        </TabsContent>

        <TabsContent value="assignments" className="mt-5 min-h-0 flex-1 pb-6">
          <PolicyAssignmentsTab
            policyId={policy.id}
            policyName={policy.displayName}
            isArchived={isArchived}
          />
        </TabsContent>
      </Tabs>

      <PolicyWizardModal
        isOpen={isEditOpen && Boolean(editInitialValues)}
        isLoading={saveMutation.isPending}
        mode="edit"
        leaveTypeName={leaveType?.name}
        initialValues={editInitialValues}
        editImpact={editImpactQuery.data}
        onSubmitAction={handleEditSaveSafely}
        onCancelAction={() => setIsEditOpen(false)}
      />

      <DeleteTimeOffPolicyModal
        isOpen={isDeleteOpen}
        isLoading={deleteMutation.isPending}
        errorMessage={deleteError}
        policy={policy}
        onConfirmAction={handleDelete}
        onRequestCloseAction={() => {
          setIsDeleteOpen(false);
          setDeleteError(null);
        }}
      />
    </div>
  );
}
