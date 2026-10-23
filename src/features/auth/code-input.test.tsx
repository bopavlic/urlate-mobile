import { fireEvent, render, screen } from "@testing-library/react-native";

import { CodeInput } from "./code-input";

describe("CodeInput", () => {
  it("reports the code once, when the sixth digit arrives", async () => {
    const onComplete = jest.fn();
    await render(<CodeInput onComplete={onComplete} />);
    const input = screen.getByLabelText("Sign-in code");
    await fireEvent.changeText(input, "12345");
    expect(onComplete).not.toHaveBeenCalled();
    await fireEvent.changeText(input, "123456");
    await fireEvent.changeText(input, "123456");
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith("123456");
  });

  it("accepts a pasted code with spaces", async () => {
    const onComplete = jest.fn();
    await render(<CodeInput onComplete={onComplete} />);
    await fireEvent.changeText(
      screen.getByLabelText("Sign-in code"),
      "123 456",
    );
    expect(onComplete).toHaveBeenCalledWith("123456");
  });

  it("shows each digit in its own box", async () => {
    await render(<CodeInput onComplete={jest.fn()} />);
    await fireEvent.changeText(screen.getByLabelText("Sign-in code"), "42");
    expect(screen.getByText("4")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
  });
});
