import { it, expect } from "vitest";
import {
  initialTable,
  connectMember,
  disconnectMember,
  checkCompletion,
} from "../../packages/domain/src/index.js";
it("completes once when pending voter leaves, preserving vote", () => {
  let s = connectMember(initialTable("t", "r"), "a", "Ana", 0);
  s = connectMember(s, "b", "Bia", 0);
  s.votes.a = 5;
  expect(checkCompletion(s)).toBe(false);
  s = disconnectMember(s, "b", 1);
  expect(s.completionEmitted).toBe(true);
  expect(checkCompletion(s)).toBe(false);
  s = disconnectMember(s, "a", 2);
  expect(s.votes.a).toBe(5);
});
it("does not complete zero voters or observer-only room", () => {
  let s = initialTable("t", "r");
  expect(checkCompletion(s)).toBe(false);
  s = connectMember(s, "a", "A", 0);
  s.members.a!.mode = "observer";
  expect(checkCompletion(s)).toBe(false);
});
it("caps at 20 and permits replacement without another seat", () => {
  let s = initialTable("t", "r");
  for (let i = 0; i < 20; i++) s = connectMember(s, "" + i, "Person", 0);
  expect(() => connectMember(s, "21", "New", 0)).toThrow("TABLE_FULL");
  expect(connectMember(s, "0", "Again", 0).members["0"]!.seat).toBe(0);
});
