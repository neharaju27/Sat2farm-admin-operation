
import React, { useMemo } from 'react';
import { Info } from 'lucide-react';

/**
 * Custom Early Access Banner.
 * Only selected users should see this banner through App.jsx.
 */

const DEFAULT_MESSAGE =
  'You are currently using the Early Access version. Please share your feedback, suggestions, or any issues with the respective POC.';

const PAYMENT_NOTE =
  '**Payment Reminder:** Your payment is pending. Please contact your respective POC to verify your payment status. If payment has already been made, kindly disregard this reminder.';

// Add user-specific banner records here if required.
const USER_BANNER_DATA = {
  // '9876543210': {
  //   label: 'Account Update',
  //   message: 'Example user-specific message from the sheet.',
  // },
};

function normalizePhone(value) {
  return String(value ?? '')
    .replace(/\D/g, '')
    .replace(/^91(?=\d{10}$)/, '');
}

export default function EarlyAccessBannerCustom({
  user,
  className = '',
}) {
  const bannerContent = useMemo(() => {
    const phone = normalizePhone(
      user?.phone_number ??
      user?.phoneNumber ??
      user?.pNumber ??
      user?.username
    );

    const record = phone ? USER_BANNER_DATA[phone] : null;

    return {
      label: record?.label || 'Early Access',
      message: record?.message || DEFAULT_MESSAGE,
    };
  }, [user]);

  return (
    <div
      className={`ea-banner ${className}`}
      role="status"
      aria-live="polite"
    >
      <style>{`
        .ea-banner {
          width: 100%;
          position: relative;
          z-index: 50;
          overflow: hidden;
          color: #fff;
          border-bottom: 1px solid rgba(99, 102, 241, .3);
          background: linear-gradient(
            90deg,
            rgba(15, 23, 42, .97),
            rgba(30, 27, 75, .97),
            rgba(15, 23, 42, .97)
          );
          box-shadow: 0 4px 12px rgba(15, 23, 42, .15);
          isolation: isolate;
        }

        .ea-banner::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          opacity: .2;
          background-image:
            linear-gradient(to right, #8080800a 1px, transparent 1px),
            linear-gradient(to bottom, #8080800a 1px, transparent 1px);
          background-size: 20px 20px;
        }

        .ea-banner__viewport {
          overflow: hidden;
          padding: 10px 0;
        }

        .ea-banner__track {
          display: flex;
          width: max-content;
          animation: ea-banner-marquee 35s linear infinite;
          will-change: transform;
        }

        .ea-banner:hover .ea-banner__track,
        .ea-banner:focus-within .ea-banner__track {
          animation-play-state: paused;
        }

        .ea-banner__item {
          display: flex;
          flex-shrink: 0;
          align-items: center;
          gap: 12px;
          padding-right: 80px;
          white-space: nowrap;
        }

        .ea-banner__label {
          display: inline-flex;
          align-items: center;
          padding: 2px 8px;
          border: 1px solid rgba(99, 102, 241, .3);
          border-radius: 4px;
          background: rgba(99, 102, 241, .2);
          color: #c7d2fe;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: .04em;
          text-transform: uppercase;
        }

        .ea-banner__message {
          color: #e2e8f0;
          font-size: 13px;
          font-weight: 500;
        }

        /* Highlighted payment note */
        .ea-banner__payment-note {
          display: inline-block;
          color: #fef08a;
          font-weight: 800;
          background: rgba(234, 179, 8, .18);
          border: 1px solid rgba(250, 204, 21, .65);
          border-radius: 4px;
          padding: 2px 6px;
          margin-left: 4px;
        }

        .ea-banner__info {
          width: 16px;
          height: 16px;
          flex: 0 0 auto;
          color: #818cf8;
        }

        .ea-banner__glow {
          position: absolute;
          right: 0;
          bottom: 0;
          left: 0;
          height: 1px;
          pointer-events: none;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(129, 140, 248, .5),
            transparent
          );
        }

        @keyframes ea-banner-marquee {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(-50%, 0, 0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ea-banner__track {
            animation: none;
            width: 100%;
          }

          .ea-banner__item[aria-hidden='true'] {
            display: none;
          }
        }
      `}</style>

      <div className="ea-banner__viewport">
        <div className="ea-banner__track">
          {[0, 1].map((copy) => (
            <div
              className="ea-banner__item"
              key={copy}
              aria-hidden={copy === 1 ? 'true' : undefined}
            >
              <span className="ea-banner__label">
                {bannerContent.label}
              </span>

              <span className="ea-banner__message">
                {bannerContent.message}

                {bannerContent.message === DEFAULT_MESSAGE && (
                  <>
                    {' '}
                    <strong className="ea-banner__payment-note">
                      {PAYMENT_NOTE}
                    </strong>
                  </>
                )}
              </span>

              <Info
                className="ea-banner__info"
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="ea-banner__glow" />
    </div>
  );
}
