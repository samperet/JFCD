'use client';

export default function TypingRow({ avatar, name }) {
  return (
    <div className="row in group-end group-start">
      <img className="row-avatar" src={avatar} alt={`${name} is typing`} />
      <div className="bubble-col">
        <div
          className="typing-bubble"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label={`${name} is typing`}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
