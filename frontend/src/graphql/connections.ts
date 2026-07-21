import { gql } from '@apollo/client'

export const CONNECTIONS_STATUS_QUERY = gql`
  query ConnectionsStatus {
    connectionsStatus {
      count
    }
  }
`

export const CONNECTIONS_CHANGED_SUBSCRIPTION = gql`
  subscription ConnectionsChanged {
    connectionsChanged {
      count
    }
  }
`
