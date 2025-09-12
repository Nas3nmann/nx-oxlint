import { ReactLib } from '@nx-oxlint/react-lib';
import { tsLib } from '@nx-oxlint/ts-lib';

export function App() {
  const tsMessage = tsLib();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Nx Oxlint Plugin Demo
        </h1>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">
              Library Dependencies Test
            </h2>
            <p className="text-gray-600 mb-4">
              This app demonstrates the dependency chain: react-app → react-lib
              → ts-lib
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">
                  React Library Component:
                </h3>
                <ReactLib />
              </div>

              <div>
                <h3 className="font-medium text-gray-800 mb-2">
                  Direct ts-lib usage:
                </h3>
                <div className="p-3 bg-gray-100 rounded border">
                  <code className="text-sm">{tsMessage}</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
