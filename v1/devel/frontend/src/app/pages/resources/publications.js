import React from 'react'

import { 
    Container, 
    Text,
    Title,
    Anchor,
    List
    } from '@mantine/core'

const papers = [
    {
        key: "lyons2019",
        authors: "Lyons, L. R., Nishimura, Y., Zhang, S.-R., Coster, A. J., Bhatt, A., Kendall, E., & Deng, Y.",
        date: "2019",
        title: "Identification of auroral zone activity driving large-scale traveling ionospheric disturbances",
        journal: "Journal of Geophysical Research: Space Physics",
        pages: "124, 700–714",
        doi: "https://doi.org/10.1029/2018JA025980"
    },
    {
        key: "heale2019",
        authors: "Heale, C. J., Snively, J. B., Bhatt, A. N., Hoffmann, L., Stephan, C. C., & Kendall, E. A.",
        date: "2019",
        title: "Multilayer observations and modeling of thunderstorm-generated gravity waves over the Midwestern United States",
        journal: "Geophysical Research Letters",
        pages: "46, 14164–14174",
        doi: "https://doi.org/10.1029/2019GL085934"
    },
    {
        key: "bhatt2020",
        authors: "Bhatt, A., Valentic, T., Reimer, A., Lamarche, L., Reyes, P., & Cosgrove, R.",
        date: "2020",
        title: "Reproducible Software Environment: a tool enabling computational reproducibility in geospace sciences and facilitating collaboration",
        journal: "J. Space Weather Space Clim.",
        pages: "10 (2020) 12",
        doi: "https://doi.org/10.1051/swsc/2020011"
    },
    {   
        key: "marinis2021",
        authors: "Martinis, C., Nishimura, Y., Wroten, J., Bhatt, A., Dyer, A., Baumgardner, J., & Gallardo-Lacourt, B.",
        date: "2021",
        title: "First simultaneous observation of STEVE and SAR arc combining data from citizen scientists, 630.0 nm all-sky images, and satellites",
        journal: "Geophysical Research Letters",
        pages: "48, e2020GL092169",
        doi: "https://doi.org/10.1029/2020GL092169"
    }
]

const Publications = () => {

    const items = papers.map(paper => (
        <List.Item key={paper.key}>
          <Text key={paper.key} span>
            { paper.authors }{" "}({paper.date}).{" "}{ paper.title }.{" "}
            <i>{paper.journal}</i>,{" "}
            {paper.pages}.{" "} 
            <Anchor href={paper.doi}>{paper.doi}</Anchor>
          </Text>
        </List.Item>
    ))

    return (
      <Container my="2em" size="md">
        <Title color="slate"> Publications </Title>

        <List type="ordered" mt="1em" withPadding spacing="md">
          { items }
        </List>

      </Container>
    )
}

export { Publications }
