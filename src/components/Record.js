import React, { useState } from 'react';
import './Record.css';
import { useTable } from 'react-table';
import { ApproveRejectButtons } from './Buttons';

const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const tzOptions = {timezone: zone};
const todayFormatted = (new Date()).toLocaleDateString("en-US", tzOptions);


export function CreateRecordPage({ onCancel, subClassName }) {
  const [type, setType] = useState("Expense");
  const [category, setCategory] = useState("Food");
  const [amount, setAmount] = useState(0);
  const [notes, setNotes] = useState("");

  const submitToApi = (event) => {
    event.preventDefault();
    const submission = {
      type: type,
      categoryName: category,
      amount: amount,
      notes: notes
    };
    alert(`Submitting ${submission} to api`);
    console.log(submission);
  }

  const handleExit = () => {
    onCancel();
    return false;
  }

  return (
    <div className={subClassName + " CreateRecordPage"}>
      <form className="CreateRecordForm" onSubmit={submitToApi}>
        <h1>Create a new record <hr /></h1>
        <label className="InputLabel">
          Type
          <select
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
            value={category}
            className="UserInput"
            name="categoryName"
            onChange={ e => setCategory(e.target.value) }
          >
            {
              // should generate from API
              ["Salary","Food","Transportation"]
              .map(val => <option value={val} key={val}>{val}</option>)
            }
          </select>
        </label>
        <label className="InputLabel">
          Amount
          <input
            className="UserInput"
            name="amount"
            type="number"
            onChange={ e => setAmount(e.target.value) }
          />
        </label>
        <label className="InputLabel">
          Notes
          <textarea
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
    return (dateDiff <= 1)
        ? `${dateDiff === 0 ? "Today" : "Yesterday"}, ${timestamp}`
        : (dateDiff <= 7)
            ? `${dateDiff} days ago`
            : dateTime.toDateString("en-US", tzOptions)
}


export function RecordTable(props) {
    
    const columns = React.useMemo(
        () => [
            { Header: "Category", accessor: "categoryName" },
            { Header: "Amount", accessor: "amount" },
            { Header: "Timestamp", accessor: "createTimeFormatted" },
            { Header: "Notes", accessor: "notes" },
        ]
    , []);
    
    const dataArr = [ // will convert to dynamoDB query
        {
            categoryName: "Food",
            type: "Expense",
            amount: -100,
            createTime: 1585579834,
            notes: "this is a very very very very long note",
        }
        ,{
            categoryName: "Salary",
            type: "Income",
            amount: 300,
            createTime: 1585589834,
            notes: "first paycheck!",
        }
    ];
    const dataArrFormatted =
        dataArr.sort(record => -record.createTime)
        .map(record => {
            return {
                ...record,
                createTimeFormatted: formatDate(new Date(record.createTime * 1000))
            }
        });
    const data = React.useMemo(
        () => dataArrFormatted
    , [dataArrFormatted]);
    
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