'use client';

export default function TypingRow({ avatar, name }) {
  return (
    <div className="row in group-end group-start">
      <img className="row-avatar" src={avatar} alt={`${name} is typing`} />
      <div className="bubble-col">
        <div className="typing-bubble" role="status" aria-label={`${name} is typing`}>
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
