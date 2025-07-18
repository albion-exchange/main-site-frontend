import "@testing-library/jest-dom/vitest";
import { render, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";

import Button from "./Button.svelte";

// Basic interaction tests for the Button component

describe("Button", () => {
  it("fires click event when clicked", async () => {
    const { component, getByRole } = render(Button, {
      props: { variant: "primary" },
      slots: { default: "Click me" },
    });

    const handleClick = vi.fn();
    component.$on("click", handleClick);

    const button = getByRole("button");
    await fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true", () => {
    const { getByRole } = render(Button, {
      props: { disabled: true },
      slots: { default: "Disabled" },
    });

    const button = getByRole("button");
    expect(button).toBeDisabled();
  });
});