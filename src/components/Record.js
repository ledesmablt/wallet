import React, { useState } from 'react';
import { useStoreState, useStoreActions } from 'easy-peasy';
import './Record.css';
import { useTable } from 'react-table';
import { ApproveRejectDeleteButtons } from './Buttons';

const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const tzOptions = {timeZone: zone};
const todayFormatted = (new Date()).toLocaleDateString("en-US", tzOptions);


export function CreateRecordPage({ subClassName }) {
  return (
    <RecordPage
      submissionType="create"
      subClassName={subClassName + " Create "}
      headerMessage="Create a new record"
    />
  )
}

export function ModifyRecordPage({ subClassName }) {
  return (
    <RecordPage
      submissionType="modify"
      subClassName={subClassName + " Modify "}
      headerMessage="Modify a record"
    />
  )
}


function RecordPage({ submissionType, subClassName, headerMessage }) {
  const [updated, setUpdated] = useState(false);

  // current record (what the user clicked on, if modifying)
  var currentRecord = useStoreState(state => state.records.current);
  const updateCurrentRecord = useStoreActions(actions => actions.records.updateCurrent);

  // current creating record (form input)
  var currentCreatingRecord = useStoreState(state => state.records.creating);
  const updateCreatingRecord = useStoreActions(actions => actions.records.updateCreating);
  
  // helper store actions
  const createRecord = useStoreActions(actions => actions.records.create);
  const modifyRecord = useStoreActions(actions => actions.records.modify);
  const deleteRecord = useStoreActions(actions => actions.records.delete);
  const updateAppState = useStoreActions(actions => actions.app.updateState);
  
  // form input variables
  const categoryList = useStoreState(state => state.categories.items);
  const { type, categoryName, amount, notes } = currentCreatingRecord;
  const categoryId = (categoryList.find(obj => obj.categoryName === categoryName) || { categoryId: "N/A"}).categoryId;

  // update store when fomr is updated
  const handleUpdate = (event) => {
    const { name, value } = event.target
    currentCreatingRecord[name] = value;
    updateCreatingRecord(currentCreatingRecord);
    setUpdated(!updated);
  }

  const formatAmount = (amount) => {
    if ([undefined, ""].includes(amount)) {
      return undefined;
    } else {
      return type === "Income" ? Math.abs(amount) : - Math.abs(amount)
    }
  }
  const formatNotes = (notes) => {
    return notes === "" ? undefined : notes;
  }
  
  const handleExit = () => {
    // reset record and app to default
    setTimeout(() => {
      updateCurrentRecord({});
      updateCreatingRecord({
        type: type,
        categoryName: categoryName,
        amount: "",
        notes: ""
      });
    }, 700);
    updateAppState('default');
  }
  
  const createRecordApi = (event) => {
    // create a new record in the API
    event.preventDefault();
    const submission = {
      type: type,
      categoryId: categoryId,
      amount: formatAmount(amount),
      notes: formatNotes(notes)
    };
    createRecord(submission);
    handleExit();
  };

  const modifyRecordApi = (event) => {
    // modify an existing record if there are changes (based on recordId)
    event.preventDefault();
    const submission = {
      recordId: currentRecord.recordId,
      type: type,
      categoryId: categoryId,
      amount: formatAmount(amount),
      notes: formatNotes(notes)
    };
    modifyRecord(submission);
    handleExit();
  };

  const deleteRecordApi = (event) => {
    // delete record from database
    event.preventDefault();
    deleteRecord({ recordId: currentRecord.recordId });
    handleExit();
  }
  

  let executeSubmission;
  switch (submissionType) {
    case 'create':
      executeSubmission = createRecordApi;
      break;
    case 'modify':
      executeSubmission = modifyRecordApi;
      break;
    default:
      break;
  };

  return (
    <div className={subClassName + " CreateRecordPage"}>
      <form className="CreateRecordForm" onSubmit={executeSubmission}>
        <h1>{headerMessage} <hr /></h1>
        <label className="InputLabel">
          Type
          <select
            required
            value={type}
            className="UserInput"
            name="type"
            onChange={(event) => handleUpdate(event)}
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
            value={categoryName}
            className="UserInput"
            name="categoryName"
            onChange={(event) => handleUpdate(event)}
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
            value={([undefined, ""].includes(amount)) ? amount || "" : Math.abs(amount)}
            className="UserInput"
            name="amount"
            type="number"
            min="1"
            onChange={(event) => handleUpdate(event)}
          />
        </label>
        <label className="InputLabel">
          Notes
          <textarea
            value={notes || ""}
            className="UserInput"
            name="notes"
            type="text"
            onChange={(event) => handleUpdate(event)}
          />
        </label>
        <ApproveRejectDeleteButtons
          rejectHandler={handleExit}
          deleteHandler={deleteRecordApi}
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


export function RecordTable({ show }) {
  const updateAppState = useStoreActions(actions => actions.app.updateState);
  const updateCurrentRecord = useStoreActions(actions => actions.records.updateCurrent);

  // column headers mapped to records dict keys
  const columns = React.useMemo(
      () => [
          { Header: "Category", accessor: "categoryName" },
          { Header: "Amount", accessor: "amount" },
          { Header: "Timestamp", accessor: "createTimeFormatted" },
          { Header: "Notes", accessor: "notes" },
      ]
  , []);

  // last 10 records sorted by createTime desc
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
  ).slice(0, show)

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
            <tr
              recordid={row.original.recordId}
              onClick={() => {
                const foundRecord = records.find(rec => rec.recordId === row.original.recordId);
                updateCurrentRecord({
                  type: foundRecord.type,
                  categoryName: foundRecord.categoryName,
                  amount: foundRecord.amount,
                  notes: foundRecord.notes,
                  categoryId: foundRecord.categoryId,
                  recordId: foundRecord.recordId
                });
                updateAppState('modifyRecord');
              }}
              {...row.getRowProps()}
            >
            {row.cells.map(cell => {
              let cellProps = cell.getCellProps();
              if ((cell.column.Header) === "Amount") {
                const extProps = (cell.value < 0 ? {className: "isExpense"} : null)
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