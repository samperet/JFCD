'use client';

export default function MessageRow({ message, mine, groupStart, groupEnd, showReceipt, avatar }) {
  const cls = [
    'row',
    mine ? 'out' : 'in',
    groupStart ? 'group-start' : '',
    groupEnd ? 'group-end' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <div className={cls}>
        {!mine &&
          (groupEnd ? (
            <img className="row-avatar" src={avatar} alt={message.sender} />
          ) : (
            <span className="row-avatar ghost" aria-hidden="true" />
          ))}

        <div className="bubble-col">
          {!mine && groupStart && <span className="sender-name">{message.sender}</span>}
          <div className="bubble">{message.text}</div>
        </div>
      </div>
      {showReceipt && <div className="receipt">Delivered</div>}
    </>
  );
}
