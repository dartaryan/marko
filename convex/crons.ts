import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "abuse detection scan",
  { hours: 1 },
  internal.abuse.detectAbuse,
);

export default crons;
