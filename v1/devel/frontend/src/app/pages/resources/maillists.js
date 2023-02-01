import React from 'react'

import { 
    Container, 
    Title,
    Table
    } from '@mantine/core'

const MailLists = () => {

    const lists = [
        {
            name:   'Alerts',
            desc:   'Automated aert messages from the MANGO system',
            url:    'https://mangonetwork.org/mailman/listinfo/mango-alert'
        },
        {
            name:   'Announcements',
            desc:   'Project announcements',
            url:    'https://mangonetwork.org/mailman/listinfo/mango-announce'
        },
        {
            name:   'Community',
            desc:   'General discussion list for the MANGO community',
            url:    'https://mangonetwork.org/mailman/listinfo/mango-community'
        },
        {
            name:   'Summary',
            desc:   'Daily summary reports',
            url:    'https://mangonetwork.org/mailman/listinfo/mango-summary'
        },
        {
            name:   'Team',
            desc:   'MANGO team discussions (private list)',
            url:    'https://mangonetwork.org/mailman/listinfo/mango-team'
        }
    ]

    const rows = lists.map(list => (
        <tr key={list.name}>
          <td>
            <a href={list.url} target="_blank" rel="noreferrer">
              {list.name}
            </a>
          </td>
          <td>{list.desc}</td>
        </tr>
    ))

    return (
      <Container my="2em" size="md">

        <Title color="slate"> Mailing Lists </Title>

        <Table striped mt="1em">
          <thead>
            <tr>
              <th>List</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </Table>

      </Container>
    )
}

export { MailLists }
