import React from 'react'
import { Link } from 'react-router-dom'
import { 
    Container, 
    Title,
    Text,
    Card,
} from '@mantine/core'

const Contacts = () => {

    return (
        <Container size="md" mt="2em">
          <Title><Text color="slate" inherit component="span">
            Contact Us
          </Text></Title>

          <Card shadow="xs" radius="md" withBorder mt="1em">
            <Text>
              For more information, contact:{" "}
              <a href="mailto:mango@mangonetwork.org">mango@mangonetwork.org</a>
            </Text>
            <Text my="1em">
                MANGO Project Team <br />
                SRI International <br />
                333 Ravenswood Ave <br />
                Menlo Park, CA 94025
            </Text>

            <Text>
              Join our <Link to="/resources/maillists">mailing lists</Link>.
            </Text>
          </Card>
         
        </Container>
    )
}

export { Contacts } 
