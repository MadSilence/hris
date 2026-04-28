import { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import { OfficeDetailsModal } from "./OfficeDetailsModal";

const mockOfficeDetailsForm = jest.fn();

let mockedFormSubmission = {
  name: "Warsaw Office Updated",
  description: "",
  email: "warsaw@example.com",
  phone: "",
  country: "Poland",
  city: "Warsaw",
  street: "",
  building: "",
  postCode: "",
};

jest.mock("../OfficeDetailsForm/OfficeDetailsForm", () => ({
  OfficeDetailsForm: (props: any) => {
    mockOfficeDetailsForm(props);

    return (
      <div>
        <input
          aria-label="Office name"
          onChange={() => props.onDirtyChangeAction?.(true)}
          disabled={props.isLoading}
        />

        <button type="button" disabled={props.isLoading} onClick={props.onCancelAction}>
          Cancel
        </button>

        <button
          type="button"
          disabled={props.isLoading}
          onClick={() => props.onSubmitAction(mockedFormSubmission)}
        >
          Save
        </button>
      </div>
    );
  },
}));

jest.mock(
  "@/components/modules/settings/modules/office/components/OfficeDetailsView",
  () => ({
    __esModule: true,
    default: ({ office }: any) => <div>Details view: {office.name}</div>,
    OfficeDetailsView: ({ office }: any) => <div>Details view: {office.name}</div>,
  }),
);

jest.mock(
  "@/components/modules/settings/modules/office/components/DeleteOfficeModal",
  () => ({
    DeleteOfficeModal: ({
      isOpen,
      onConfirm,
      onRequestClose,
    }: any) =>
      isOpen ? (
        <div>
          <button onClick={onRequestClose}>Cancel delete</button>
          <button onClick={onConfirm}>Confirm delete</button>
        </div>
      ) : null,
  }),
);

jest.mock("@/public/icons/trash.svg", () => ({
  __esModule: true,
  default: (props: any) => <svg {...props} />,
}));

const office = {
  id: "office-1",
  name: "Warsaw Office",
  description: "",
  email: "warsaw@example.com",
  phone: "",
  country: "Poland",
  city: "Warsaw",
  street: "",
  building: "",
  postCode: "",
} as any;

const renderModal = (
  props?: Partial<ComponentProps<typeof OfficeDetailsModal>>,
) => {
  const defaultProps: ComponentProps<typeof OfficeDetailsModal> = {
    isOpen: true,
    isLoading: false,
    isDeleteLoading: false,
    office,
    onCancelAction: jest.fn(),
    onDeleteAction: jest.fn(),
    onSaveAction: jest.fn(),
  };

  const mergedProps = {
    ...defaultProps,
    ...props,
  };

  return {
    ...render(<OfficeDetailsModal {...mergedProps} />),
    props: mergedProps,
  };
};

describe("OfficeDetailsModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedFormSubmission = {
      name: "Warsaw Office Updated",
      description: "",
      email: "warsaw@example.com",
      phone: "",
      country: "Poland",
      city: "Warsaw",
      street: "",
      building: "",
      postCode: "",
    };
  });

  it("renders details view", () => {
    renderModal();

    expect(
      screen.getByRole("heading", { name: /office/i }),
    ).toBeInTheDocument();

    expect(screen.getByText(/details view: warsaw office/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
  });

  it("switches to edit mode and passes props to form", () => {
    renderModal();

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));

    expect(mockOfficeDetailsForm).toHaveBeenCalledWith(
      expect.objectContaining({
        isLoading: false,
        initialValues: expect.objectContaining({
          name: "Warsaw Office",
          email: "warsaw@example.com",
        }),
      }),
    );

    expect(screen.getByLabelText(/office name/i)).toBeInTheDocument();
  });

  it("calls save action from form submit", () => {
    const onSaveAction = jest.fn();

    renderModal({ onSaveAction });

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(onSaveAction).toHaveBeenCalledWith(mockedFormSubmission);
  });

  it("cancels edit mode", () => {
    renderModal();

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.getByText(/details view: warsaw office/i)).toBeInTheDocument();
  });

  it("opens delete modal and confirms delete", () => {
    const onDeleteAction = jest.fn();

    renderModal({ onDeleteAction });

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    expect(screen.getByText(/confirm delete/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/confirm delete/i));

    expect(onDeleteAction).toHaveBeenCalledTimes(1);
  });
});
