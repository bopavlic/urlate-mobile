import { exportFileName, exportMyDataFile, type ExportDataDeps } from './export-data';

describe('exportFileName', () => {
  it('dates the file by the day it was exported', () => {
    expect(exportFileName('2026-10-24T17:58:07.454Z')).toBe('urlate-export-2026-10-24.json');
  });
});

describe('exportMyDataFile', () => {
  it('fetches the export, saves it readable and opens the share sheet', async () => {
    const calls: string[] = [];
    const deps: ExportDataDeps = {
      fetchExport: async () => ({ format: 'urlate-export/1', exportedAt: '2026-10-24T09:00:00Z' }),
      writeFile: async (name, contents) => {
        calls.push(`write:${name}:${contents.split('\n').length > 1 ? 'pretty' : 'one-line'}`);
        return `file:///cache/${name}`;
      },
      share: async (uri) => {
        calls.push(`share:${uri}`);
      },
    };
    await exportMyDataFile(deps);
    expect(calls).toEqual([
      'write:urlate-export-2026-10-24.json:pretty',
      'share:file:///cache/urlate-export-2026-10-24.json',
    ]);
  });

  it('shares nothing when the export fails', async () => {
    const share = jest.fn();
    await expect(
      exportMyDataFile({
        fetchExport: async () => {
          throw new Error('offline');
        },
        writeFile: jest.fn(),
        share,
      }),
    ).rejects.toThrow('offline');
    expect(share).not.toHaveBeenCalled();
  });
});
