import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ApplicationForm from "./ApplicationForm";

describe("ApplicationForm", () => {
  it("binds Mortgaged Yes/No per Land and Building row independently", () => {
    render(<ApplicationForm />);

    const landSection = screen.getByText("Land and Building").closest(".property-card");
    expect(landSection).not.toBeNull();

    const row0Yes = landSection.querySelector('input[name="lm-table-0"][value="Yes"]');
    const row0No = landSection.querySelector('input[name="lm-table-0"][value="No"]');
    const row1Yes = landSection.querySelector('input[name="lm-table-1"][value="Yes"]');
    const row1No = landSection.querySelector('input[name="lm-table-1"][value="No"]');

    expect(row0Yes).not.toBeNull();
    expect(row0No).not.toBeNull();
    expect(row1Yes).not.toBeNull();
    expect(row1No).not.toBeNull();

    expect(row0Yes.checked).toBe(false);
    expect(row0No.checked).toBe(false);
    expect(row1Yes.checked).toBe(false);
    expect(row1No.checked).toBe(false);

    fireEvent.change(row0Yes, { target: { checked: true } });
    expect(row0Yes.checked).toBe(true);
    expect(row0No.checked).toBe(false);

    fireEvent.change(row0No, { target: { checked: true } });
    expect(row0Yes.checked).toBe(false);
    expect(row0No.checked).toBe(true);

    fireEvent.change(row1Yes, { target: { checked: true } });
    expect(row1Yes.checked).toBe(true);
    expect(row1No.checked).toBe(false);
    expect(row0No.checked).toBe(true);

    fireEvent.change(row1No, { target: { checked: true } });
    expect(row1Yes.checked).toBe(false);
    expect(row1No.checked).toBe(true);
    expect(row0No.checked).toBe(true);
  });
});
