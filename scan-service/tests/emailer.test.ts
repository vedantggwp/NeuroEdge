import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const sendMock = vi.fn();

vi.mock('resend', () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

describe('sendReport', () => {
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

  it('throws when RESEND_API_KEY is missing', async () => {
    delete process.env['RESEND_API_KEY'];
    const { sendReport } = await import('../src/emailer.js');
    await expect(
      sendReport('user@example.com', Buffer.from('pdf'), 'https://example.com', 72),
    ).rejects.toThrow('RESEND_API_KEY');
  });

  it('sends email with correct fields and PDF attachment', async () => {
    process.env['RESEND_API_KEY'] = 'test-key';
    sendMock.mockResolvedValueOnce({ data: { id: 'msg-1' }, error: null });
    const { sendReport } = await import('../src/emailer.js');
    const pdf = Buffer.from('fake-pdf-content');

    await sendReport('owner@example.com', pdf, 'https://shop.example.com', 85);

    expect(sendMock).toHaveBeenCalledOnce();
    const call = sendMock.mock.calls[0]![0];
    expect(call.to).toBe('owner@example.com');
    expect(call.subject).toContain('85/100');
    expect(call.html).toContain('shop.example.com');
    expect(call.attachments).toHaveLength(1);
    expect(call.attachments[0].filename).toContain('.pdf');
    expect(call.attachments[0].content).toBe(pdf);
  });

  it('includes "Good" label for score >= 80', async () => {
    process.env['RESEND_API_KEY'] = 'test-key';
    sendMock.mockResolvedValueOnce({ data: { id: 'msg-2' }, error: null });
    const { sendReport } = await import('../src/emailer.js');

    await sendReport('a@b.com', Buffer.from(''), 'https://a.com', 90);
    const html = sendMock.mock.calls[0]![0].html;
    expect(html).toContain('Good');
  });

  it('includes "Needs Attention" label for score 50-79', async () => {
    process.env['RESEND_API_KEY'] = 'test-key';
    sendMock.mockResolvedValueOnce({ data: { id: 'msg-3' }, error: null });
    const { sendReport } = await import('../src/emailer.js');

    await sendReport('a@b.com', Buffer.from(''), 'https://a.com', 60);
    const html = sendMock.mock.calls[0]![0].html;
    expect(html).toContain('Needs Attention');
  });

  it('includes "Urgent Action Needed" label for score < 50', async () => {
    process.env['RESEND_API_KEY'] = 'test-key';
    sendMock.mockResolvedValueOnce({ data: { id: 'msg-4' }, error: null });
    const { sendReport } = await import('../src/emailer.js');

    await sendReport('a@b.com', Buffer.from(''), 'https://a.com', 30);
    const html = sendMock.mock.calls[0]![0].html;
    expect(html).toContain('Urgent Action Needed');
  });

  it('throws when Resend returns an error', async () => {
    process.env['RESEND_API_KEY'] = 'test-key';
    sendMock.mockResolvedValueOnce({
      data: null,
      error: { message: 'Invalid recipient', name: 'validation_error' },
    });
    const { sendReport } = await import('../src/emailer.js');

    await expect(
      sendReport('bad@example.com', Buffer.from(''), 'https://a.com', 50),
    ).rejects.toThrow('Failed to send email');
  });
});
