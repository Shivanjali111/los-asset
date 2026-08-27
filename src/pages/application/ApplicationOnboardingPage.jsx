import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ApplicationOnboardingPage.css";
import CustomerIdentityPage from "./CustomerIdentityPage";
import FacilityBranchLoanDetailsPage from "./FacilityBranchLoanDetailsPage";
import EligibilitySupportingDetailsPage from "./EligibilitySupportingDetailsPage";

const LEAD_API =
  "https://xx8ep3p2ue.execute-api.ap-south-1.amazonaws.com/prod/leads";

const LEAD_DETAILS_API =
  "https://700pag34e9.execute-api.ap-south-1.amazonaws.com/prod/leads";

const FORCED_ETB_MOBILE = "8552051111";

const normalizeMobile = (value) =>
  String(value || "").replace(/\D/g, "").slice(-10);

const isForcedEtbMobile = (mobile) =>
  normalizeMobile(mobile) === FORCED_ETB_MOBILE;

const BackIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.8" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const ChevronIcon = ({ left = false }) => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
    <path d={left ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
  </svg>
);

const SaveIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.1" aria-hidden="true">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
    <path d="M17 21v-8H7v8" />
    <path d="M7 3v5h8" />
  </svg>
);

const CustomerIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="12" cy="7" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

const JewelleryIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
    <path d="m4 8 4-5h8l4 5-8 13Z" />
    <path d="M4 8h16M8 3l4 5 4-5M8 8l4 13 4-13" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    <path d="m9 12 2 2 4-5" />
  </svg>
);

const FacilityIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 10h18M7 15h3" />
  </svg>
);

const STEPS = [
  {
    id: "customer-identity",
    number: "01",
    title: "Customer Identity & Consent",
    shortTitle: "Identity & Consent",
    description: "ETB/NTB identity, KYC confirmation and initial consent",
    icon: CustomerIcon,
    component: CustomerIdentityPage,
    dataKey: "customerIdentity",
  },
  {
    id: "facility-branch-loan",
    number: "02",
    title: "Facility, Branch, Loan & Jewellery Details",
    shortTitle: "Facility, Loan & Jewellery",
    description: "Branch, scheme, requested amount and jewellery details",
    icon: FacilityIcon,
    component: FacilityBranchLoanDetailsPage,
    dataKey: "facilityBranchLoanDetails",
  },
  {
    id: "eligibility-supporting",
    number: "03",
    title: "Eligibility & Supporting Details",
    shortTitle: "Eligibility & Docs",
    description: "Conditional CIBIL assessment and Agri supporting details",
    icon: ShieldIcon,
    component: EligibilitySupportingDetailsPage,
    dataKey: "eligibilitySupportingDetails",
  },
];

const INITIAL_APPLICATION_DATA = {
  customerIdentity: {},
  facilityBranchLoanDetails: {
    branchType: "Home",
    facilityType: "",
    schemeName: "",
    purpose: "",
    requestedLoanAmount: "",
    aggregateExposure: "",
    repaymentType: "",
    chargesAccount: "",
    disbursementAccount: "",
    jewelleryItems: [],
  },
  eligibilitySupportingDetails: {
    cibilRequired: false,
    bureauConsent: false,
    cibilStatus: "Not evaluated",
    landDetailsRequired: false,
  },
};

const DEFAULT_STEP_STATUSES = {
  "customer-identity": "In Progress",
  "facility-branch-loan": "Not Started",
  "eligibility-supporting": "Not Started",
};

const VALID_STEP_STATUSES = [
  "Completed",
  "In Progress",
  "Not Started",
  "Needs Rework",
  "Blocked",
];

const parseLeadDetails = (value) => {
  if (!value) return {};
  if (typeof value === "object") return value;

  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn("lead_details is not valid JSON:", error);
    return {};
  }
};

const getSavedOnboarding = (leadDetails = {}) =>
  leadDetails.applicationOnboarding ||
  leadDetails.application_onboarding ||
  {};

const buildInitialApplicationData = (leadDetails = {}) => {
  const onboarding = getSavedOnboarding(leadDetails);

  const savedApplicationData =
    onboarding.applicationData ||
    leadDetails.applicationData ||
    {};

  return Object.fromEntries(
    Object.entries(INITIAL_APPLICATION_DATA).map(
      ([sectionKey, defaults]) => [
        sectionKey,
        {
          ...defaults,
          ...(leadDetails[sectionKey] || {}),
          ...(onboarding[sectionKey] || {}),
          ...(savedApplicationData[sectionKey] || {}),
        },
      ]
    )
  );
};

const buildInitialStatuses = (leadDetails = {}) => {
  const onboarding = getSavedOnboarding(leadDetails);

  const savedStatuses =
    onboarding.stepStatuses ||
    leadDetails.stepStatuses ||
    {};

  const applicationCreated = Boolean(
    onboarding.applicationCreated ||
      leadDetails.applicationCreated
  );

  if (applicationCreated) {
    return Object.fromEntries(
      STEPS.map((step) => [step.id, "Completed"])
    );
  }

  const statuses = { ...DEFAULT_STEP_STATUSES };

  STEPS.forEach((step) => {
    if (VALID_STEP_STATUSES.includes(savedStatuses[step.id])) {
      statuses[step.id] = savedStatuses[step.id];
    }
  });

  const hasInProgressStep =
    Object.values(statuses).includes("In Progress");

  if (!hasInProgressStep) {
    const firstIncompleteStep = STEPS.find(
      (step) => statuses[step.id] !== "Completed"
    );

    if (firstIncompleteStep) {
      statuses[firstIncompleteStep.id] = "In Progress";
    }
  }

  return statuses;
};

const STATUS_CLASS = {
  Completed: "completed",
  "In Progress": "in-progress",
  "Not Started": "not-started",
  "Needs Rework": "needs-rework",
  Blocked: "blocked",
};

const getRelationshipType = (lead) => {
  if (isForcedEtbMobile(lead?.mobile)) {
    return "ETB";
  }

  const value =
    lead?.relationshipType ||
    lead?.relationship?.type ||
    lead?.customerType ||
    (lead?.cbsCustomerId ? "ETB" : "NTB");

  return String(value || "NTB").toUpperCase() === "ETB"
    ? "ETB"
    : "NTB";
};

const formatCurrency = (value) =>
  Number(value || 0) > 0
    ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(Number(value))
    : "To be entered";

const getActiveStepChecks = ({
  activeStepId,
  applicationData,
  stepStatuses,
}) => {
  const stepComplete = stepStatuses[activeStepId] === "Completed";

  if (activeStepId === "customer-identity") {
    const identity = applicationData.customerIdentity || {};
    const consentStatus =
      identity.consentStatus || identity.consent?.status || "";
    const identityConfirmed = Boolean(
      identity.customerIdentityConfirmed ||
        identity.identityConfirmed ||
        identity.confirmCustomerIdentity?.completed ||
        stepComplete
    );
    const consentCaptured =
      /captured|accepted|verified|completed/i.test(consentStatus) ||
      stepComplete;
    const borrowerCaptured = Boolean(
      identity.borrowerInformation ||
        identity.borrowerDetails ||
        identity.panDetails ||
        stepComplete
    );

    return [
      { label: "Confirm customer and CBS relationship", done: identityConfirmed },
      { label: "Capture customer consent", done: consentCaptured },
      { label: "Complete borrower and KYC details", done: borrowerCaptured },
    ];
  }

  if (activeStepId === "facility-branch-loan") {
    const facility = applicationData.facilityBranchLoanDetails || {};
    const loan = facility.productFacilityAndScheme || facility;
    const branch = facility.branchSelection || {};
    const jewelleryItems = Array.isArray(facility.jewelleryItems)
      ? facility.jewelleryItems
      : [];

    return [
      {
        label: "Select servicing branch",
        done: Boolean(
          branch.selectedBranchCode || branch.selectedBranch?.code || stepComplete
        ),
      },
      {
        label: "Set scheme, amount, tenure and repayment",
        done: Boolean(
          (loan.schemeName && loan.requestedLoanAmount && loan.tenure) ||
            stepComplete
        ),
      },
      {
        label: "Record jewellery and ownership proof",
        done: jewelleryItems.length > 0 || stepComplete,
      },
    ];
  }

  const eligibility = applicationData.eligibilitySupportingDetails || {};
  const cibil = eligibility.cibil || {};
  const land = eligibility.land || {};
  const cibilRequired = cibil.required ?? eligibility.cibilRequired;
  const landRequired = land.required ?? eligibility.landDetailsRequired;

  return [
    {
      label: cibilRequired === false
        ? "CIBIL assessment not required"
        : "Complete CIBIL assessment",
      done:
        cibilRequired === false || cibil.status === "Completed" || stepComplete,
    },
    {
      label: landRequired === true
        ? "Complete Agri land evidence"
        : "Agri land evidence not required",
      done:
        landRequired !== true || land.status === "Completed" || stepComplete,
    },
    {
      label: "Save and create the application",
      done: stepComplete,
    },
  ];
};

function ApplicationSnapshotPanel({
  applicationData,
  relationshipType,
  activeStep,
  stepStatuses,
}) {
  const facility = applicationData.facilityBranchLoanDetails || {};
  const loan = facility.productFacilityAndScheme || facility;
  const exposure = facility.exposure || {};
  const selectedBranch =
    facility.branchSelection?.selectedBranch || facility.selectedBranch || {};
  const jewelleryItems = Array.isArray(facility.jewelleryItems)
    ? facility.jewelleryItems
    : [];
  const eligibility = applicationData.eligibilitySupportingDetails || {};
  const cibil = eligibility.cibil || {};
  const land = eligibility.land || {};

  const requestedAmount =
    exposure.requestedLoanAmount ??
    loan.requestedLoanAmount ??
    facility.requestedLoanAmount;
  const scheme = loan.schemeName || facility.schemeName || "To be selected";
  const branch =
    selectedBranch.name ||
    facility.branchSelection?.selectedBranchCode ||
    "To be selected";
  const terms = [loan.tenure || facility.tenure, loan.repaymentType]
    .filter(Boolean)
    .join(" · ") || "To be selected";
  const totalOrnaments = jewelleryItems.reduce(
    (total, item) => total + Number(item.numberOfItems || 1),
    0
  );
  const isCibilRequired =
    cibil.required ?? eligibility.cibilRequired;
  const isLandRequired =
    land.required ?? eligibility.landDetailsRequired;
  const cibilStatus =
    isCibilRequired === false
      ? "Not required"
      : cibil.status === "Completed"
        ? `Completed · Score ${cibil.score || "—"}`
        : cibil.status || eligibility.cibilStatus || "Pending decision";
  const landStatus =
    isLandRequired === true
      ? land.status || "Pending"
      : "Not required";
  const completedSteps = Object.values(stepStatuses).filter(
    (status) => status === "Completed"
  ).length;

  const summaryRows = [
    { label: "Customer type", value: relationshipType },
    { label: "Servicing branch", value: branch },
    { label: "Scheme", value: scheme },
    { label: "Requested amount", value: formatCurrency(requestedAmount) },
    { label: "Tenure & repayment", value: terms },
    {
      label: "Jewellery offered",
      value: jewelleryItems.length
        ? `${totalOrnaments} item${totalOrnaments === 1 ? "" : "s"} across ${jewelleryItems.length} ornament record${jewelleryItems.length === 1 ? "" : "s"}`
        : "Not captured",
    },
    { label: "CIBIL assessment", value: cibilStatus },
    { label: "Agri support", value: landStatus },
  ];

  return (
    <aside className="application-snapshot-panel">
      <div className="snapshot-panel-head">
        <span>APPLICATION SNAPSHOT</span>
        <h3>Captured details</h3>
        <p>Live summary of information recorded across the application steps.</p>
      </div>

      <div className="snapshot-current-step">
        <span>Currently working on</span>
        <strong>{activeStep.shortTitle}</strong>
        <small>{completedSteps}/{STEPS.length} steps completed</small>
      </div>

      <dl className="snapshot-detail-list">
        {summaryRows.map((item) => (
          <div className="snapshot-detail-row" key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>

      <div className="snapshot-save-note">
        <CheckIcon />
        <span>Values refresh from the saved lead-details JSON.</span>
      </div>
    </aside>
  );
}

function ApplicationOnboardingPage({ onLogout }) {
  const navigate = useNavigate();
  const { leadId } = useParams();

  const [activeStepId, setActiveStepId] = useState(
    STEPS[0].id
  );

  const [stepStatuses, setStepStatuses] = useState(
    buildInitialStatuses
  );

  const [applicationData, setApplicationData] = useState(
    INITIAL_APPLICATION_DATA
  );

  const [applicationCreated, setApplicationCreated] =
    useState(false);

  const [applicationNumber, setApplicationNumber] =
    useState("");

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const leadRef = useRef(null);
  const applicationDataRef = useRef(INITIAL_APPLICATION_DATA);
  const stepStatusesRef = useRef(buildInitialStatuses());

  const setLeadAndRef = useCallback((valueOrUpdater) => {
    setLead((previous) => {
      const nextLead =
        typeof valueOrUpdater === "function"
          ? valueOrUpdater(previous)
          : valueOrUpdater;
      leadRef.current = nextLead;

      if (nextLead) {
        const nextLeadDetails = parseLeadDetails(
          nextLead.leadDetails ?? nextLead.lead_details
        );
        const synchronizedApplicationData = {
          ...applicationDataRef.current,
        };
        STEPS.forEach((step) => {
          if (nextLeadDetails[step.dataKey]) {
            synchronizedApplicationData[step.dataKey] =
              nextLeadDetails[step.dataKey];
          }
        });
        applicationDataRef.current = synchronizedApplicationData;
      }

      return nextLead;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchLead = async () => {
      try {
        const response = await fetch(
          `${LEAD_API}/${leadId}`
        );

        if (!response.ok) {
          throw new Error(
            `Unable to fetch lead (${response.status})`
          );
        }

        const data = await response.json();

        if (!cancelled && data.success) {
          const details = parseLeadDetails(
            data.data.lead_details
          );

          const savedOnboarding =
            getSavedOnboarding(details);

          const savedStatuses =
            buildInitialStatuses(details);

          const isApplicationCreated = Boolean(
            savedOnboarding.applicationCreated ||
              details.applicationCreated
          );

          const savedApplicationNumber =
            savedOnboarding.applicationNumber ||
            details.applicationNumber ||
            `GL-${String(data.data.leadnumber || leadId)
              .replace(/\D/g, "")
              .slice(-6)
              .padStart(6, "0")}`;

          const savedCustomerName = [
            data.data.first_name,
            data.data.middle_name,
            data.data.last_name,
          ]
            .filter(Boolean)
            .join(" ");

          if (isApplicationCreated) {
            navigate(
              `/applications/${encodeURIComponent(
                savedApplicationNumber
              )}?leadId=${encodeURIComponent(data.data.leadnumber)}`,
              {
                replace: true,
                state: {
                  leadId: data.data.leadnumber,
                  customerName: savedCustomerName,
                },
              }
            );

            return;
          }

          const savedActiveStepId =
            savedOnboarding.activeStepId ||
            details.activeStepId;

          const relationshipType = isForcedEtbMobile(
            data.data.mobile
          )
            ? "ETB"
            : details.relationshipType ||
              data.data.relationship_type ||
              data.data.customer_type;

          setLeadAndRef({
            id: data.data.leadnumber,
            firstName: data.data.first_name,
            middleName: data.data.middle_name,
            lastName: data.data.last_name,
            mobile: data.data.mobile,
            email: data.data.email,
            product: "Gold Loan",
            source: data.data.source || "Branch",
            owner: data.data.owner || "Branch Maker",
            relationshipType,
            cbsCustomerId:
              details.cbsCustomerId ||
              data.data.cbs_customer_id ||
              data.data.cbscustomerid,
            customerId:
              details.customerId ||
              data.data.customer_id,
            homeBranch:
              details.homeBranch ||
              data.data.home_branch,
            kycStatus:
              details.kycStatus ||
              data.data.kyc_status,
            leadDetails: details,
          });

          const restoredApplicationData =
            buildInitialApplicationData(details);
          applicationDataRef.current = restoredApplicationData;
          setApplicationData(restoredApplicationData);

          stepStatusesRef.current = savedStatuses;
          setStepStatuses(savedStatuses);

          setApplicationCreated(
            isApplicationCreated
          );

          setApplicationNumber(
            savedApplicationNumber
          );

          if (
            STEPS.some(
              (step) => step.id === savedActiveStepId
            )
          ) {
            setActiveStepId(savedActiveStepId);
          } else {
            const firstOpenStep = STEPS.find(
              (step) =>
                savedStatuses[step.id] !== "Completed"
            );

            setActiveStepId(
              firstOpenStep?.id ||
                STEPS[STEPS.length - 1].id
            );
          }
        }
      } catch (error) {
        console.error("Fetch Lead Error:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchLead();

    return () => {
      cancelled = true;
    };
  }, [leadId, navigate, setLeadAndRef]);

  useEffect(() => {
    if (!lead) return;
    const latestLeadDetails = parseLeadDetails(
      lead.leadDetails ?? lead.lead_details
    );

    setApplicationData((previous) => {
      const synchronizedApplicationData = { ...previous };
      let changed = false;

      STEPS.forEach((step) => {
        if (!latestLeadDetails[step.dataKey]) return;
        synchronizedApplicationData[step.dataKey] =
          latestLeadDetails[step.dataKey];
        changed = true;
      });

      if (!changed) return previous;
      applicationDataRef.current = synchronizedApplicationData;
      return synchronizedApplicationData;
    });
  }, [lead]);

  const activeStepIndex = STEPS.findIndex(
    (step) => step.id === activeStepId
  );

  const activeStep =
    STEPS[activeStepIndex] || STEPS[0];

  const ActiveStepComponent = activeStep.component;

  const relationshipType =
    getRelationshipType(lead);

  const completedCount = Object.values(
    stepStatuses
  ).filter(
    (status) => status === "Completed"
  ).length;

  const progressPercent = Math.round(
    (completedCount / STEPS.length) * 100
  );

  const isLastStep =
    activeStepIndex === STEPS.length - 1;

  const canContinue =
    stepStatuses[activeStep.id] === "Completed";

  const activeStepChecks = useMemo(
    () =>
      getActiveStepChecks({
        activeStepId,
        applicationData,
        stepStatuses,
      }),
    [activeStepId, applicationData, stepStatuses]
  );

  const applicantName = [
    lead?.firstName,
    lead?.middleName,
    lead?.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  const stepStats = useMemo(
    () => [
      {
        label: "Application No.",
        value:
          applicationNumber ||
          "Generated after Step 3",
      },
      {
        label: "Lead No.",
        value: lead?.id || leadId,
      },
      {
        label: "Customer",
        value: applicantName || "—",
      },
      {
        label: "Relationship",
        value: relationshipType,
      },
      {
        label: "Product",
        value: "Gold Loan",
      },
      {
        label: "Stage",
        value: applicationCreated
          ? "Awaiting Gold Appraisal"
          : "Application Creation",
      },
    ],
    [
      applicationNumber,
      lead?.id,
      leadId,
      applicantName,
      relationshipType,
      applicationCreated,
    ]
  );

  const updateApplicationData = (
    section,
    values
  ) => {
    setApplicationData((previous) => {
      const nextApplicationData = {
        ...previous,
        [section]: {
          ...(previous[section] || {}),
          ...values,
        },
      };
      applicationDataRef.current = nextApplicationData;
      return nextApplicationData;
    });
  };

  const updateLeadDetails = (values) => {
    setLeadAndRef((previous) => {
      if (!previous) return previous;
      const mergedLeadDetails = {
        ...parseLeadDetails(
          previous.leadDetails ?? previous.lead_details
        ),
        ...values,
      };
      const nextLead = {
        ...previous,
        leadDetails: mergedLeadDetails,
      };
      if (Object.prototype.hasOwnProperty.call(previous, "lead_details")) {
        nextLead.lead_details = mergedLeadDetails;
      }
      return nextLead;
    });
  };

  const updateStepStatus = (
    stepId,
    status
  ) => {
    setStepStatuses((previous) => {
      const nextStepStatuses = {
        ...previous,
        [stepId]: status,
      };
      stepStatusesRef.current = nextStepStatuses;
      return nextStepStatuses;
    });
  };

  const persistLeadDetails = async (options = {}) => {
    const latestLead = leadRef.current || lead;
    const nextApplicationData =
      options.nextApplicationData || applicationDataRef.current;
    const nextStepStatuses =
      options.nextStepStatuses || stepStatusesRef.current;
    const nextActiveStepId =
      options.nextActiveStepId || activeStepId;
    const nextCurrentStep =
      options.nextCurrentStep ?? Math.max(activeStepIndex + 1, 1);
    const nextApplicationCreated =
      options.nextApplicationCreated ?? applicationCreated;
    const nextApplicationNumber =
      options.nextApplicationNumber ?? applicationNumber;
    const savedAt = new Date().toISOString();

    const currentLeadDetails =
      parseLeadDetails(
        latestLead?.leadDetails ?? latestLead?.lead_details
      );

    const currentOnboarding =
      getSavedOnboarding(currentLeadDetails);

    const persistedApplicationData = Object.fromEntries(
      STEPS.map((step) => {
        const stateSection =
          nextApplicationData?.[step.dataKey] || {};
        const leadSection =
          currentLeadDetails?.[step.dataKey] || {};

        return [
          step.dataKey,
          {
            ...leadSection,
            ...stateSection,
          },
        ];
      })
    );

    const nextLeadDetails = {
      ...currentLeadDetails,
      ...persistedApplicationData,

      relationshipType:
        getRelationshipType(latestLead),

      currentStep: nextCurrentStep,
      applicationCreated: nextApplicationCreated,
      applicationNumber: nextApplicationNumber,
      stage: nextApplicationCreated
        ? "Awaiting Gold Appraisal"
        : "Application Creation",
      lastSavedAt: savedAt,

      ...(nextApplicationCreated
        ? {
            applicationCreatedAt:
              currentLeadDetails.applicationCreatedAt || savedAt,
            applicationSubmission: {
              ...(currentLeadDetails.applicationSubmission || {}),
              status: "Submitted",
              submittedAt:
                currentLeadDetails.applicationSubmission?.submittedAt ||
                savedAt,
              routedTo: "Gold Appraisal",
            },
          }
        : {}),

      applicationOnboarding: {
        ...currentOnboarding,
        applicationData: persistedApplicationData,
        stepStatuses: nextStepStatuses,
        activeStepId: nextActiveStepId,
        currentStep: nextCurrentStep,
        applicationCreated:
          nextApplicationCreated,
        applicationNumber:
          nextApplicationNumber,
        stage: nextApplicationCreated
          ? "Awaiting Gold Appraisal"
          : "Application Creation",
        updatedAt: savedAt,
      },
    };

    setSaving(true);
    setSaveError("");

    try {
      const recordLeadId =
        latestLead?.id || leadId;

      const response = await fetch(
        `${LEAD_DETAILS_API}/${encodeURIComponent(
          recordLeadId
        )}/details`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            leadId: recordLeadId,
            leadDetailsPatch: nextLeadDetails,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Unable to save lead details (${response.status})`
        );
      }

      const responseText =
        await response.text();

      let result = null;

      if (responseText) {
        try {
          result = JSON.parse(responseText);
        } catch {
          result = null;
        }
      }

      if (result?.success === false) {
        throw new Error(
          result.message ||
            "Unable to save lead details"
        );
      }

      const returnedLeadDetails =
        parseLeadDetails(
          result?.data?.lead_details ||
            result?.data?.leadDetails ||
            result?.leadDetails
        );

      const persistedLeadDetails =
        Object.keys(returnedLeadDetails).length
          ? returnedLeadDetails
          : nextLeadDetails;

      applicationDataRef.current = persistedApplicationData;
      setApplicationData(persistedApplicationData);

      setLeadAndRef((previous) => {
        if (!previous) return previous;

        const latestLocalDetails = parseLeadDetails(
          previous.leadDetails ?? previous.lead_details
        );
        const mergedLeadDetails = {
          ...latestLocalDetails,
          ...persistedLeadDetails,
        };

        STEPS.forEach((step) => {
          mergedLeadDetails[step.dataKey] = {
            ...(persistedLeadDetails[step.dataKey] || {}),
            ...(latestLocalDetails[step.dataKey] || {}),
          };
        });

        const nextLead = {
          ...previous,
          leadDetails: mergedLeadDetails,
        };
        if (Object.prototype.hasOwnProperty.call(previous, "lead_details")) {
          nextLead.lead_details = mergedLeadDetails;
        }
        return nextLead;
      });

      return persistedLeadDetails;
    } catch (error) {
      console.error(
        "Save Lead Details Error:",
        error
      );

      setSaveError(
        error.message ||
          "Could not save the application"
      );

      throw error;
    } finally {
      setSaving(false);
    }
  };

  const saveDraft = async () => {
    if (saving) return;

    try {
      await persistLeadDetails();
    } catch {
      // Error handled in UI
    }
  };

  const saveAndContinue = async () => {
    if (saving || !canContinue) return;

    if (isLastStep) {
      const generatedNumber =
        `GL-${new Date().getFullYear()}-${String(
          lead?.id || leadId
        )
          .replace(/\D/g, "")
          .slice(-6)
          .padStart(6, "0")}`;

      const nextApplicationData = {
        ...applicationDataRef.current,
      };

      const nextStepStatuses = {
        ...stepStatusesRef.current,
        [activeStep.id]: "Completed",
      };

      try {
        await persistLeadDetails({
          nextApplicationData,
          nextStepStatuses,
          nextActiveStepId: activeStep.id,
          nextCurrentStep: 3,
          nextApplicationCreated: true,
          nextApplicationNumber: generatedNumber,
        });

        stepStatusesRef.current = nextStepStatuses;
        setStepStatuses(nextStepStatuses);
        setApplicationNumber(generatedNumber);
        setApplicationCreated(true);

        navigate(
          `/applications/${encodeURIComponent(
            generatedNumber
          )}?leadId=${encodeURIComponent(lead?.id || leadId)}`,
          {
            replace: true,
            state: {
              leadId: lead?.id || leadId,
              customerName: applicantName,
            },
          }
        );
      } catch {
        // Persist error is already displayed; remain on Step 3.
      }

      return;
    }

    const nextStep = STEPS[activeStepIndex + 1];

    const nextStepStatuses = {
      ...stepStatusesRef.current,
      [activeStep.id]: "Completed",
      [nextStep.id]:
        stepStatuses[nextStep.id] === "Not Started"
          ? "In Progress"
          : stepStatuses[nextStep.id],
    };

    try {
      await persistLeadDetails({
        nextStepStatuses,
        nextActiveStepId: nextStep.id,
        nextCurrentStep: activeStepIndex + 2,
      });

      stepStatusesRef.current = nextStepStatuses;
      setStepStatuses(nextStepStatuses);
      setActiveStepId(nextStep.id);
    } catch {
      // Keep on current step on error
    }
  };

  const handleBack = () => {
    navigate(`/leads/${leadId}`);
  };

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    }

    navigate("/login", {
      replace: true,
    });
  };

  if (loading) {
    return (
      <div className="application-loading">
        Loading gold-loan application…
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="app-onboarding-page">
        <header className="app-onboarding-topbar">
          <button
            className="back-button"
            type="button"
            onClick={handleBack}
            aria-label="Back to lead"
          >
            <BackIcon />
          </button>

          <img
            className="yes-bank-logo"
            src="/images/yes-bank-logo-dark-bg.png"
            alt="YES BANK"
          />
        </header>

        <main className="not-found-card">
          Lead {leadId} could not be loaded.
        </main>
      </div>
    );
  }

  return (
    <div className="app-onboarding-page">
      <div className="app-header-zone">
        <header className="app-onboarding-topbar">
          <div className="app-topbar-left">
            <button
              className="back-button"
              type="button"
              onClick={handleBack}
              aria-label="Back to lead"
            >
              <BackIcon />
            </button>

            <img
              className="yes-bank-logo"
              src="/images/yes-bank-logo-dark-bg.png"
              alt="YES BANK"
            />

            <span className="topbar-divider" />

            <div>
              <h1 className="topbar-title">
                Gold Loan Application Creation
              </h1>

              <p className="topbar-subtitle">
                Branch maker workspace
              </p>
            </div>
          </div>

          <div className="app-topbar-right">
            <span className="gold-product-pill">
              <JewelleryIcon />
              Gold Loan
            </span>

            <button
              className="record-action-logout"
              type="button"
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </div>
        </header>

        <div className="application-summary-strip">
          {stepStats.map((item) => (
            <div className="summary-item" key={item.label}>
              <span className="summary-label">{item.label}</span>
              <strong className="summary-value">{item.value}</strong>
            </div>
          ))}

          <div className="summary-item summary-progress-item">
            <div className="summary-progress-header">
              <span className="summary-label">Completion</span>
              <strong className="summary-value">
                {progressPercent}% · {completedCount}/{STEPS.length}
              </strong>
            </div>

            <div className="progress-track-thin">
              <div
                className="progress-fill-thin"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {applicationCreated && (
        <div className="application-created-banner" role="status">
          <span className="application-created-icon">
            <CheckIcon />
          </span>

          <div>
            <strong>{applicationNumber} created successfully</strong>
            <p>
              The application is now Awaiting Gold Appraisal and can be opened
              by the branch jeweller/appraiser.
            </p>
          </div>
        </div>
      )}

      <main className="app-onboarding-shell">
        <section className="app-workspace">
          <aside className="app-stepper-panel">
            <div className="stepper-panel-header">
              <div>
                <span className="stepper-eyebrow">
                  BEFORE GOLD APPRAISAL
                </span>

                <h2 className="stepper-panel-title">
                  Application steps
                </h2>
              </div>

              <span className="stepper-panel-count">
                {completedCount}/{STEPS.length}
              </span>
            </div>

            <div className="stepper-timeline">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const status = stepStatuses[step.id];
                const isActive = step.id === activeStepId;
                const completed = status === "Completed";
                const statusClass =
                  STATUS_CLASS[status] || "not-started";

                return (
                  <button
                    key={step.id}
                    type="button"
                    className={`stepper-row ${isActive ? "active" : ""}`}
                    onClick={() => setActiveStepId(step.id)}
                  >
                    <span
                      className={`step-node ${statusClass} ${
                        isActive ? "active" : ""
                      }`}
                    >
                      {completed ? <CheckIcon /> : <Icon />}
                    </span>

                    <span className="stepper-copy">
                      <span className="stepper-step-number">
                        STEP {step.number}
                      </span>

                      <strong className="stepper-step-title">
                        {step.shortTitle}
                      </strong>

                      <span className="stepper-step-desc">
                        {step.description}
                      </span>
                    </span>

                    {isActive && (
                      <span className="stepper-active-arrow">
                        <ChevronIcon />
                      </span>
                    )}

                    {index < STEPS.length - 1 && (
                      <span
                        className={`step-connector ${
                          completed ? "filled" : ""
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="app-step-content">
            <div className="step-body-card">
              <div className="step-card-header">
                <div>
                  <span className="step-card-breadcrumb">
                    Step {activeStep.number} / {STEPS.length}
                  </span>

                  <h2 className="step-card-title">
                    {activeStep.title}
                  </h2>

                  <p className="step-card-desc">
                    {activeStep.description}
                  </p>
                </div>

                <span
                  className={`status-pill ${
                    STATUS_CLASS[stepStatuses[activeStep.id]] || "not-started"
                  }`}
                >
                  {stepStatuses[activeStep.id]}
                </span>
              </div>

              <div className="step-card-body">
                <ActiveStepComponent
                  lead={lead}
                  setLead={setLeadAndRef}
                  leadId={leadId}
                  leadDetails={lead.leadDetails}
                  relationshipType={relationshipType}
                  stepData={applicationData[activeStep.dataKey]}
                  sectionKey={activeStep.dataKey}
                  stepId={activeStep.id}
                  applicationData={applicationData}
                  loanData={applicationData.facilityBranchLoanDetails}
                  updateApplicationData={updateApplicationData}
                  updateLeadDetails={updateLeadDetails}
                  updateStepStatus={updateStepStatus}
                />
              </div>
            </div>
          </section>

          <ApplicationSnapshotPanel
            applicationData={applicationData}
            relationshipType={relationshipType}
            activeStep={activeStep}
            stepStatuses={stepStatuses}
          />

        </section>
      </main>

      <footer className="application-action-bar">
        <div className="footer-step-info">
          <span>
            Step {activeStepIndex + 1} of {STEPS.length}
          </span>

          <strong>{activeStep.shortTitle}</strong>
        </div>

        <div className="footer-actions">
          {saveError && (
            <span className="status-pill needs-rework" role="alert">
              {saveError}
            </span>
          )}

          <button
            className="btn-prev"
            type="button"
            onClick={() => setActiveStepId(STEPS[activeStepIndex - 1]?.id)}
            disabled={activeStepIndex === 0 || saving}
          >
            <ChevronIcon left />
            Previous
          </button>

          <button
            className="secondary-button"
            type="button"
            onClick={saveDraft}
            disabled={saving || applicationCreated}
          >
            <SaveIcon />
            {saving ? "Saving…" : "Save Draft"}
          </button>

          <button
            className="primary-button"
            type="button"
            onClick={saveAndContinue}
            disabled={saving || applicationCreated || !canContinue}
          >
            {saving
              ? "Saving…"
              : isLastStep
                ? "Create & Send for Gold Appraisal"
                : "Save & Continue"}

            {!saving && !isLastStep && <ChevronIcon />}
          </button>
        </div>
      </footer>
    </div>
  );
}

export default ApplicationOnboardingPage;
