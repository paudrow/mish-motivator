# Rewardy

This is an attempt to create a Deno app to gamify daily tasks.

In short, you negotiate a number of spins for your most important tasks and if
you complete them you get to spin the wheel and get a reward.

The rewards go towards an accumulating balance that can be used to buy things in
real life, like bubble tea (you have to buy it, but you shouldn't feel as guilty
about it).

## Usage

You can see the available tasks with `deno task`.

Some commands to note:

- `deno task run` will run the application and make a new location for the data,
  so that it isn't overwritten during testing.
- `deno task test` will run the tests.
- `deno task get-avg-payout` looks at the payout tickets and calculates the
  average payout as well as shows the percentages of each payout.

## Tech stack

This uses Deno for a TypeScript runtime and DenoKV for a key-value store.

Soon it should use Fresh as a UI for displaying things.
