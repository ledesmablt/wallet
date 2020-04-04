import React, { useState } from 'react';
import { useStoreState, useStoreActions } from 'easy-peasy';
import './Record.css';
import { useTable } from 'react-table';
import { ApproveRejectButtons } from './Buttons';

const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const tzOptions = {timezone: zone};
const todayFormatted = (new Date()).toLocaleDateString("en-US", tzOptions);

export function CreateRecordPage({ onCancel, subClassName }) {
  const [type, setType] = useState("Expense");
  const [category, setCategory] = useState("Food");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const categoryList = useStoreState(state => state.categories.items);
  const createRecord = useStoreActions(actions => actions.records.create);

  const submitToApi = (event) => {
    event.preventDefault();
    const categoryId = categoryList.find(obj => obj.categoryName === category).categoryId;
    const submission = {
      type: type,
      categoryId: categoryId,
      amount: type === "Income" ? parseInt(amount) : - parseInt(amount),
      notes: notes !== "" ? notes : undefined
    };
    createRecord(submission);
    handleExit();
  };

  const handleExit = () => {
    // reset values after transition ends
    setTimeout(() => {
      setAmount("");
      setNotes("");
    }, 700);
    onCancel();
    return false;
  };

  return (
    <div className={subClassName + " CreateRecordPage"}>
      <form className="CreateRecordForm" onSubmit={submitToApi}>
        <h1>Create a new record <hr /></h1>
        <label className="InputLabel">
          Type
          <select
            required
            value={type}
            className="UserInput"
            name="type"
            onChange={ e => setType(e.target.value) }
          >
            {
              ["Income", "Expense"]
              .map(val => <option value={val} key={val}>{val}</option>)
            }
          </select>
        </label>
        <label className="InputLabel">
          Category
          <select
            required
            value={category}
            className="UserInput"
            name="categoryName"
            onChange={ e => setCategory(e.target.value) }
          >
            {
              categoryList
              .map(val => <option value={val.categoryName} key={val.categoryName}>{val.categoryName}</option>)
            }
          </select>
        </label>
        <label className="InputLabel">
          Amount
          <input
            required
            value={amount}
            className="UserInput"
            name="amount"
            type="number"
            min="1"
            onChange={ e => setAmount(e.target.value) }
          />
        </label>
        <label className="InputLabel">
          Notes
          <textarea
            value={notes}
            className="UserInput"
            name="notes"
            type="text"
            onChange={ e => setNotes(e.target.value) }
          />
        </label>
        <ApproveRejectButtons
          rejectHandler={handleExit}
        />
      </form>
    </div>
  );
}


function formatDate(dateTime) {
  const dtFormatted = dateTime.toLocaleDateString()
  const dateDiff = parseInt((new Date(todayFormatted)) - (new Date(dtFormatted))) / (1000 * 60 * 60 * 24);
  const timestamp = dateTime.toLocaleTimeString("en-US", tzOptions);
  const formattedTimestamp = timestamp.split(':').slice(0,2).join(':') + ' ' + timestamp.split(' ')[1];
  return (dateDiff <= 1)
      ? `${dateDiff === 0 ? "Today" : "Yesterday"}, ${formattedTimestamp}`
      : (dateDiff <= 7)
          ? `${dateDiff} days ago`
          : dateTime.toDateString("en-US", tzOptions)
}


export function RecordTable(props) {
  // column headers mapped to records dict keys
  const columns = React.useMemo(
      () => [
          { Header: "Category", accessor: "categoryName" },
          { Header: "Amount", accessor: "amount" },
          { Header: "Timestamp", accessor: "createTimeFormatted" },
          { Header: "Notes", accessor: "notes" },
      ]
  , []);

  // records sorted by createTime desc
  const categoryList = useStoreState(state => state.categories.items);
  const records = useStoreState(
    state => state.records.items
  ).map(record => {
    const categoryName = categoryList.find(cat => cat.categoryId === record.categoryId);
    return categoryName === undefined ? "N/A" : {
      ...record,
      categoryName: categoryName.categoryName,
      createTimeFormatted: formatDate(new Date(record.createTime))
    }
  }).sort(
    (rec1, rec2) => rec2.createTime - rec1.createTime
  );

  // initialize react-table vars
  const data = React.useMemo(
    () => records
  , [records]);
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data })

  return (
    <table className="RecordTable" {...getTableProps()}>
      <thead>
      {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps()}>{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map(row => {
          prepareRow(row)
          return (
            <tr {...row.getRowProps()}>
            {row.cells.map(cell => {
              let cellProps = cell.getCellProps();
              if ((cell.column.Header) === "Amount") {
                const extProps = (cell.value >= 0 ? {className: "isNumber"} : { className: "isNumber isExpense" })
                cellProps = Object.assign({}, cellProps, extProps)
              }
              return <td {...cellProps}>{cell.render('Cell')}</td>
            })}
          </tr>
        )
      })}
    </tbody>
  </table>
  )
}