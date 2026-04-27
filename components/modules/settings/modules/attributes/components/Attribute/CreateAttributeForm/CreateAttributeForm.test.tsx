import { ComponentProps } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateAttributeForm } from "./CreateAttributeForm";
import { AttributeType } from "@/models/attribute";

jest.mock(
  "@/components/modules/settings/modules/attributes/components/Attribute/AttributeTypePickers/TypeSelect",
  () => ({
    TypeSelect: ({ value, onChange }: any) => (
      <select
        aria-label="Attribute type"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value={AttributeType.TEXT}>Text</option>
        <option value={AttributeType.NUMBER}>Number</option>
        <option value={AttributeType.DATE}>Date</option>
      </select>
    ),
  }),
);

jest.mock(
  "@/components/modules/settings/modules/attributes/components/Attribute/AttributeTypePickers/OptionsEditor",
  () => ({
    OptionsEditor: () => <div data-testid="options-editor"/>,
  }),
);

jest.mock(
  "@/components/modules/settings/modules/attributes/components/Attribute/AttributeTypePickers/NumberScaleRow",
  () => ({
    NumberScaleRow: ({ value, onChange, error }: any) => (
      <div>
        <input
          aria-label="Decimal scale"
          value={value ?? ""}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        {error && <p>{error}</p>}
      </div>
    ),
  }),
);

jest.mock(
  "@/components/modules/settings/modules/attributes/components/Attribute/AttributeTypePickers/DateSettings",
  () => ({
    DateSettings: ({ hideYearPublic, onChangeHideYearPublic }: any) => (
      <input
        aria-label="Hide year public"
        type="checkbox"
        checked={hideYearPublic}
        onChange={(e) => onChangeHideYearPublic(e.target.checked)}
      />
    ),
  }),
);

jest.mock(
  "@/components/modules/settings/modules/attributes/components/Attribute/AttributeTypePickers/UniqueSelect",
  () => ({
    UniqueSelect: ({ checked, onChange }: any) => (
      <input
        aria-label="Unique"
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    ),
  }),
);

const renderForm = (
  props?: Partial<ComponentProps<typeof CreateAttributeForm>>,
) => {
  const defaultProps: ComponentProps<typeof CreateAttributeForm> = {
    isLoading: false,
    onCancelAction: jest.fn(),
    onDirtyChangeAction: jest.fn(),
    onSubmitAction: jest.fn(),
  };

  return {
    ...render(<CreateAttributeForm {...defaultProps} {...props} />),
    props: {
      ...defaultProps,
      ...props,
    },
  };
};

describe("CreateAttributeForm", () => {
  it("shows validation error when name is empty", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction });

    await user.click(screen.getByRole("button", { name: /create/i }));

    expect(onSubmitAction).not.toHaveBeenCalled();

    expect(
      await screen.findByText(/please enter an attribute name/i),
    ).toBeInTheDocument();
  });

  it("submits trimmed values", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction });

    await user.type(screen.getByLabelText(/attribute name/i), " Salary ");
    await user.click(screen.getByRole("button", { name: /create/i }));

    await waitFor(() => {
      expect(onSubmitAction).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Salary",
          type: AttributeType.TEXT,
          unique: false,
          decScale: null,
          dateHideYearPublic: false,
        }),
      );
    });
  });

  it("submits by Enter", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction });

    await user.type(screen.getByLabelText(/attribute name/i), "Salary{enter}");

    await waitFor(() => {
      expect(onSubmitAction).toHaveBeenCalled();
    });
  });

  it("calls cancel action", async () => {
    const user = userEvent.setup();
    const onCancelAction = jest.fn();

    renderForm({ onCancelAction });

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancelAction).toHaveBeenCalledTimes(1);
  });

  it("reports dirty state after input change", async () => {
    const user = userEvent.setup();
    const onDirtyChangeAction = jest.fn();

    renderForm({ onDirtyChangeAction });

    await user.type(screen.getByLabelText(/attribute name/i), "Salary");

    await waitFor(() => {
      expect(onDirtyChangeAction).toHaveBeenCalledWith(true);
    });
  });

  it("does not submit while loading", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({
      isLoading: true,
      onSubmitAction,
    });

    expect(screen.getByLabelText(/attribute name/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /create/i })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /create/i }));

    expect(onSubmitAction).not.toHaveBeenCalled();
  });

  it("shows number settings for NUMBER type", async () => {
    const user = userEvent.setup();

    renderForm();

    await user.selectOptions(
      screen.getByLabelText(/attribute type/i),
      AttributeType.NUMBER,
    );

    expect(screen.getByLabelText(/decimal scale/i)).toBeInTheDocument();
  });

  it("shows date settings for DATE type", async () => {
    const user = userEvent.setup();

    renderForm();

    await user.selectOptions(
      screen.getByLabelText(/attribute type/i),
      AttributeType.DATE,
    );

    expect(screen.getByLabelText(/hide year public/i)).toBeInTheDocument();
  });

  it("sanitizes number-specific fields when type is not NUMBER", async () => {
    const user = userEvent.setup();
    const onSubmitAction = jest.fn();

    renderForm({ onSubmitAction });

    await user.type(screen.getByLabelText(/attribute name/i), "Salary");
    await user.click(screen.getByRole("button", { name: /create/i }));

    await waitFor(() => {
      expect(onSubmitAction).toHaveBeenCalledWith(
        expect.objectContaining({
          decScale: null,
        }),
      );
    });
  });
});
