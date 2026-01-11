import { useEffect, useRef, useState } from "react";
import { mergeCustomerObjects, applyMappingApproval, removeKeyFromMapping } from "./formatData";
import { customerAPI } from "../../../../api/customer";

export const useCustomerLinkage = ({
  customerId,
  isStaging,
}) => {
  const [finalData, setFinalData] = useState(null);
  const [draftData, setDraftData] = useState(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const activeCustomerRef = useRef(null);
  const appliedRef = useRef({
    draft: false,
    divisions: false,
    distributors: false,
  });

  /* -------------------- RESET -------------------- */
  useEffect(() => {
    activeCustomerRef.current = customerId;
    appliedRef.current = {
      draft: false,
      divisions: false,
      distributors: false,
    };
    setFinalData(null);
    setDraftData(null);
    setHasDraft(false);
  }, [customerId]);

  /* -------------------- MAIN FLOW -------------------- */
  useEffect(() => {
    if (!customerId) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);

        /* ---------- 1. CUSTOMER ---------- */
        const response = await customerAPI.getCustomerDetails(
          customerId,
          isStaging
        );

        if (activeCustomerRef.current !== customerId) return;

        const customerData = {
          ...response?.data,
          mapping: removeKeyFromMapping(response?.data?.mapping),
        };
        if (!customerData) return;

        /* ---------- 2. DRAFT ---------- */
        if (
          customerData?.instance?.stepInstances?.length &&
          !appliedRef.current.draft
        ) {
          const step = customerData.instance.stepInstances[0];
          const instanceId =
            customerData.instance.workflowInstance.id;
          const actorId = step.assignedUserId;

          const draftResponse =
            await customerAPI.getLatestDraft(instanceId, actorId);

          if (activeCustomerRef.current !== customerId) return;

          if (draftResponse?.data?.hasDraft) {
            appliedRef.current.draft = true;
            setHasDraft(true);
            setDraftData(draftResponse.data.draftEdits);

            const merged = mergeCustomerObjects(
              customerData,
              draftResponse.data.draftEdits
            );
            console.log(merged,23894287)

            const updated = applyMappingApproval(
              merged,
              draftResponse.data.draftEdits?.mapping,
              draftResponse.data.draftEdits?.divisions,
              draftResponse.data.draftEdits?.distributors,
              draftResponse.data.draftEdits?.customerGroupId,
            );
            console.log(updated,2398728)
            setFinalData(updated);
            return; // stop normal flow
          }
        }

        setFinalData(customerData);

        /* ---------- 3. DIVISIONS ---------- */
        if (!appliedRef.current.divisions) {
          appliedRef.current.divisions = true;

          const divisionsRes =
            await customerAPI.getCustomerDivisions(customerId);

          if (activeCustomerRef.current !== customerId) return;

          const divisions = divisionsRes?.data || [];

          setFinalData((prev) => ({
            ...prev,
            divisions: [
              ...(prev?.divisions || []),
              ...divisions
                .filter(
                  (d) =>
                    !(prev?.divisions || []).some(
                      (e) => e.divisionId === d.divisionId
                    )
                )
                .map((d) => ({ ...d, isOpen: true })),
            ],
          }));
        }

        /* ---------- 4. DISTRIBUTORS ---------- */
        if (!appliedRef.current.distributors) {
          appliedRef.current.distributors = true;

          const distributorRes =
            await customerAPI.getLinkedDistributorDivisions(customerId);

          if (activeCustomerRef.current !== customerId) return;

          const list =
            distributorRes?.data?.customer?.distributorDetails;

          if (list?.length) {
            setFinalData((prev) => ({
              ...prev,
              distributors: list.map((e) => ({
                id: e.id,
                name: e.name,
                code: e.code,
                margin: e.customerDistributorDivisionMargin,
                divisions: e.divisionDetails?.map((d) => ({
                  divisionId: d.id,
                  divisionName: d.divisionName,
                  divisionCode: d.divisionCode,
                  isActive: d.isActive,
                  isChecked: d.isActive,
                })),
                supplyMode: e.supplyModeId,
                isActive: true,
              })),
            }));
          }
        }
      } catch (err) {
        console.error("useCustomerLinkage error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [customerId, isStaging]);

  return {
    data: finalData,
    draft: draftData,
    hasDraft,
    isLoading,
  };
};
