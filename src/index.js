// @flow
import * as Ship from './ship';

function wait(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

async function waitWith<A>(ms: number, result: A): Promise<A> {
  await wait(ms);
  return result;
}

function* mainWait(): Ship.t<void> {
  console.log('start wait');
  const message = yield* Ship.wait2(waitWith, 3 * 1000, 'hi');
  console.log(message);
}

function* mainCall(): Ship.t<void> {
  console.log('start call');
  yield* Ship.call(mainWait());
}

function* mainPar(): Ship.t<void> {
  console.log('start par');
  const messages = yield* Ship.all2(
    Ship.wait2(waitWith, 3 * 1000, 'hi'),
    Ship.wait(waitWith(3 * 1000, 2))
  );
  console.log(messages);
}

async function main(): Promise<void> {
  console.log('start');
  const message = await waitWith(3 * 1000, 'hi');
  console.log(message);
  await Ship.run(mainWait());
  await Ship.run(mainCall());
  await Ship.run(mainPar());
}

main();
