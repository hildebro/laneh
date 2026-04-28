export function getMockData(url: string) {
  switch (url) {
    case '/api/public/loggedInUser':
      return { 'id': '24anxankye2nc662hjnwf3jd', 'username': 'alex' };
    case '/api/users':
      return [{
        'id': '24anxankye2nc662hjnwf3jd',
        'username': 'alex',
        'defaultDistribution': 59
      }, {
        'id': 'qv4amgyyfddwqc57fcc7ygvh',
        'username': 'merle',
        'defaultDistribution': 41
      }];
    case '/api/shopping/activeCount':
      return 5;
    case '/api/shopping/lastPurchaseDate':
      return '2026-04-28T11:41:50.959Z';
    case '/api/balance':
      return [{
        'id': 'h7weq4ldqr6zwkhjbbyqowcg',
        'date': '2026-04-28T11:45:57.665Z',
        'userId': '24anxankye2nc662hjnwf3jd',
        'price': 1745,
        'name': 'Rewe',
        'user': {
          'id': '24anxankye2nc662hjnwf3jd',
          'username': 'alex',
          'defaultDistribution': 59
        }
      }, {
        'id': '2ev4zvrmbgisjxkw27wworva',
        'date': '2026-04-28T07:07:09.648Z',
        'userId': '24anxankye2nc662hjnwf3jd',
        'price': 834,
        'name': 'Rewe',
        'user': {
          'id': '24anxankye2nc662hjnwf3jd',
          'username': 'alex',
          'defaultDistribution': 59
        }
      }, {
        'id': '5vqmpv3uciszlrfgrcuuv3be',
        'date': '2026-04-27T15:51:33.484Z',
        'userId': 'qv4amgyyfddwqc57fcc7ygvh',
        'price': 3500,
        'name': 'Rewe',
        'user': {
          'id': 'qv4amgyyfddwqc57fcc7ygvh',
          'username': 'merle',
          'defaultDistribution': 41
        }
      }];
    case '/api/balance/debts':
      return [{
        'creditor': {
          'id': '24anxankye2nc662hjnwf3jd',
          'username': 'alex',
          'defaultDistribution': 59
        },
        'debtorData': [{
          'debtor': {
            'id': 'qv4amgyyfddwqc57fcc7ygvh',
            'username': 'merle',
            'defaultDistribution': 41
          }, 'amount': 4200
        }]
      }];
    case '/api/tasks/dueTaskCount':
      return 2;
  }

  // Fallback for unmocked GET routes
  return {};
}