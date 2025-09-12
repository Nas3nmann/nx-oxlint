import { tsLib } from '@nx-oxlint/ts-lib';

export function ReactLib() {
  const message = tsLib();
  
  return (
    <div className="p-4 bg-blue-100 rounded-lg">
      <h1 className="text-xl font-bold text-blue-800">Welcome to ReactLib!</h1>
      <p className="text-blue-600">Using: {message}</p>
    </div>
  );
}

export default ReactLib;
