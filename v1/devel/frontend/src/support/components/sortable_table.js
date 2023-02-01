/************************************************************************
 *  Sortable Table
 *
 *  2020-08-29  Todd Valentic
 *              Initial implemetation
 *
\***********************************************************************/

import React from 'react'
import { Table } from 'semantic-ui-react'
import { print } from 'support/helpers'

function lookup(id,data,fields) {

    let value = id

    for (const [src,key] of fields) {
        value = data[src][value][key]
    }

    return value
}

function sort_by(ids,data,fields) {

    const sorted_ids = [...ids]

    sorted_ids.sort((a,b) => {

        const va = lookup(a,data,fields)
        const vb = lookup(b,data,fields)

        if (va<vb) {
            return -1
        } else if (va>vb) {
            return 1
        } else {
            return 0
        }
    })

    return sorted_ids
}

function sort_action(column,fields) {
    return { type: 'CHANGE_SORT', column, fields }
}

function update_action(data,ids) {
    return { type: 'UPDATE_DATA', data, ids }
}

function reducer(state,action) {

    switch (action.type) {

        case 'CHANGE_SORT':

            if (state.column === action.column) {
                return {
                   ...state,
                   ids: state.ids.reverse(),
                   direction: state.direction==='ascending' ? 'descending' : 'ascending'
                }
            }

            return {
                ...state,
                column: action.column,
                fields: action.fields,
                ids: sort_by(state.ids,state.data,action.fields),
                direction: 'ascending',
            }

        case 'UPDATE_DATA':

            const ids = sort_by(action.ids,action.data,state.fields)

            if (state.direction==='descending') {
                ids.reverse()
            }

            return {
                ...state,
                ids,
                data: action.data
            }

        default:
            throw new Error()
    }
}

function TableColumn(name,fieldstr,print_func) {
    return {
        name,
        fields: fieldstr.split(',').map(field => field.split('.')),
        print: print_func || print.as_string
        }
}

const SortableTable = ({config,data,...props}) => {

    const [state, dispatch] = React.useReducer(reducer, {
        column:     config.column,
        fields:     config.columns.find(col => col.name===config.column).fields,
        direction:  config.direction || 'ascending',
        data:       null,
        ids:        [],

    })

    if (state.data !== data) {
        dispatch(update_action(data,config.ids))
    }

    const headers = config.columns.map(column => {

        const { name, fields } = column

        const sorted = state.column===name ? state.direction : null

        return (
            <Table.HeaderCell sorted={sorted} key={name}
                onClick={() => dispatch(sort_action(name,fields))}>
              {name}
            </Table.HeaderCell>
        )
    })

    const rows = state.ids.map(id => {
        const cells = config.columns.map((column,index) => {
            const value = lookup(id,state.data,column.fields)
            return <Table.Cell key={column.name} >{column.print(value)}</Table.Cell>
        })
        return <Table.Row key={id} onClick={() => { if (config.onClick) config.onClick(id) }}>
                {cells}
               </Table.Row>
    })

    return (
      <Table celled inverted sortable color="black" className="sortable-table">
        <Table.Header>
          <Table.Row>
            { headers }
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows}
        </Table.Body>
      </Table>
    )
}

SortableTable.Column = TableColumn

export { SortableTable }
