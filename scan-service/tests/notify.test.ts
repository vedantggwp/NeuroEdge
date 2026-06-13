import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const sendMock = vi.fn();

vi.mock('resend', () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

describe('notifyFailure', () => {
  const originalEnv = process.env['RESEND_API_KEY'];

  beforeEach(() => {
    vi.resetModules();
    sendMock.mockReset();
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env['RESEND_API_KEY'] = originalEnv;
    } else {
      delete process.env['RESEND_API_KEY'];
    }
  });

  it('does nothing when RESEND_API_KEY is not set', async () => {
    delete process.env['RESEND_API_KEY'];
    const { notifyFailure } = await import('../src/notify.js');
    await notifyFailure('abc-123', 'Something broke');
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('sends an alert email when RESEND_API_KEY is set', async () => {
    process.env['RESEND_API_KEY'] = 'test-key';
    sendMock.mockResolvedValueOnce({ id: 'msg-1' });
    const { notifyFailure } = await import('../src/notify.js');
    await notifyFailure('report-id-full', 'Scan timed out');
    expect(sendMock).toHaveBeenCalledOnce();

    const call = sendMock.mock.calls[0]![0];
    expect(call.to).toBe('ved@neuroedge.co.uk');
    expect(call.subject).toContain('report-i');
    expect(call.text).toContain('report-id-full');
    expect(call.text).toContain('Scan timed out');
  });

  it('swallows email send errors silently', async () => {
    process.env['RESEND_API_KEY'] = 'test-key';
    sendMock.mockRejectedValueOnce(new Error('Network error'));
    const { notifyFailure } = await import('../src/notify.js');
    await expect(notifyFailure('abc', 'fail')).resolves.toBeUndefined();
  });
});
