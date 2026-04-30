export function getMockData(url: string) {
  switch (url) {
    case '/demo/api/export':
      return {};
    case '/demo/api/public/loggedInUser':
      return { 'id': 'ijy3sl4ltrhzeqxdsevv6ioc', 'username': 'alice' };
    case '/demo/api/users':
      return [{
        'id': 'ijy3sl4ltrhzeqxdsevv6ioc',
        'username': 'alice',
        'password': '$argon2id$v=19$m=65536,t=3,p=1$FKoMqe2bRUVTJKDujjPcEw$k/ZOoqTqXHWCNFwdyi9DPPJpV+KFFHVU84i2hepsbSM',
        'defaultDistribution': 60
      }, {
        'id': 'qpk4jeps6xviipxpxoah34s4',
        'username': 'bob',
        'password': '$argon2id$v=19$m=65536,t=3,p=1$uXCgnDAxJpVhx4EZOGhI3Q$xtipMU072/V42adSVWdkjQed2qhUr3zo25Of5jUG45c',
        'defaultDistribution': 40
      }];
    case '/demo/api/shopping/activeCount':
      return 3;
    case '/demo/api/shopping/activePurchase':
      return {
        'unstagedItemsByCategory': [{
          'id': 'yusmvqb5tggzcf7wtz2wivrb',
          'name': 'Fresh Produce',
          'shoppingItems': [{
            'id': 'mi6fk2tpjq56qqq5wxvdcyus',
            'categoryId': 'yusmvqb5tggzcf7wtz2wivrb',
            'name': 'Apple',
            'amount': '2x',
            'priority': 0,
            'active': true,
            'stagedPurchase': null
          }, {
            'id': '4btekfqouwi5f5lnsj2lxsxo',
            'categoryId': 'yusmvqb5tggzcf7wtz2wivrb',
            'name': 'Cucumber',
            'amount': '',
            'priority': 1,
            'active': true,
            'stagedPurchase': null
          }]
        }, {
          'id': '5khct2ijxd6y5kmihxwtiprc',
          'name': 'Dairy',
          'shoppingItems': [{
            'id': 'wnh7keqhiynzjdpiulzcrev3',
            'categoryId': '5khct2ijxd6y5kmihxwtiprc',
            'name': 'Yogurt',
            'amount': '500g',
            'priority': 0,
            'active': true,
            'stagedPurchase': null
          }]
        }], 'stagedItemsForUser': [], 'stagedItemsForOtherUsers': []
      };
    case '/demo/api/shopping/categoriesWithActiveItems':
      return [{
        'id': 'yusmvqb5tggzcf7wtz2wivrb',
        'name': 'Fresh Produce',
        'priority': 0,
        'shoppingItems': [{
          'id': 'mi6fk2tpjq56qqq5wxvdcyus',
          'categoryId': 'yusmvqb5tggzcf7wtz2wivrb',
          'name': 'Apple',
          'amount': '2x',
          'priority': 0,
          'active': true,
          'stagedPurchase': null
        }, {
          'id': '4btekfqouwi5f5lnsj2lxsxo',
          'categoryId': 'yusmvqb5tggzcf7wtz2wivrb',
          'name': 'Cucumber',
          'amount': '',
          'priority': 1,
          'active': true,
          'stagedPurchase': null
        }]
      }, {
        'id': '5khct2ijxd6y5kmihxwtiprc',
        'name': 'Dairy',
        'priority': 1,
        'shoppingItems': [{
          'id': 'wnh7keqhiynzjdpiulzcrev3',
          'categoryId': '5khct2ijxd6y5kmihxwtiprc',
          'name': 'Yogurt',
          'amount': '500g',
          'priority': 0,
          'active': true,
          'stagedPurchase': null
        }]
      }];
    case '/demo/api/shopping/categoriesWithItems':
      return [{
        'id': 'yusmvqb5tggzcf7wtz2wivrb',
        'name': 'Fresh Produce',
        'priority': 0,
        'shoppingItems': [{
          'id': 'mi6fk2tpjq56qqq5wxvdcyus',
          'categoryId': 'yusmvqb5tggzcf7wtz2wivrb',
          'name': 'Apple',
          'amount': '2x',
          'priority': 0,
          'active': true,
          'stagedPurchase': null
        }, {
          'id': '4btekfqouwi5f5lnsj2lxsxo',
          'categoryId': 'yusmvqb5tggzcf7wtz2wivrb',
          'name': 'Cucumber',
          'amount': '',
          'priority': 1,
          'active': true,
          'stagedPurchase': null
        }, {
          'id': 'ugwhlp5xghelkxyfae25mqbl',
          'categoryId': 'yusmvqb5tggzcf7wtz2wivrb',
          'name': 'Onion',
          'amount': '',
          'priority': 2,
          'active': false,
          'stagedPurchase': null
        }]
      }, {
        'id': '5khct2ijxd6y5kmihxwtiprc',
        'name': 'Dairy',
        'priority': 1,
        'shoppingItems': [{
          'id': 'wnh7keqhiynzjdpiulzcrev3',
          'categoryId': '5khct2ijxd6y5kmihxwtiprc',
          'name': 'Yogurt',
          'amount': '500g',
          'priority': 0,
          'active': true,
          'stagedPurchase': null
        }, {
          'id': '2bszcys4jxqsnsxdeg6qqm6c',
          'categoryId': '5khct2ijxd6y5kmihxwtiprc',
          'name': 'Milk',
          'amount': '',
          'priority': 1,
          'active': false,
          'stagedPurchase': null
        }, {
          'id': 'nftbctuenb53la2etqlwzppd',
          'categoryId': '5khct2ijxd6y5kmihxwtiprc',
          'name': 'Butter',
          'amount': '',
          'priority': 2,
          'active': false,
          'stagedPurchase': null
        }]
      }, {
        'id': 'oq6ce5s7ght7erm3xowzen64',
        'name': 'Drinks',
        'priority': 2,
        'shoppingItems': [{
          'id': 'fwgqeyttpbcdx2pgcj5oq53f',
          'categoryId': 'oq6ce5s7ght7erm3xowzen64',
          'name': 'Beer',
          'amount': '',
          'priority': 0,
          'active': false,
          'stagedPurchase': null
        }]
      }];
    case '/demo/api/shopping/category/5khct2ijxd6y5kmihxwtiprc':
      return {
        'id': '5khct2ijxd6y5kmihxwtiprc',
        'name': 'Dairy',
        'priority': 1,
        'shoppingItems': [{
          'id': 'wnh7keqhiynzjdpiulzcrev3',
          'categoryId': '5khct2ijxd6y5kmihxwtiprc',
          'name': 'Yogurt',
          'amount': '500g',
          'priority': 0,
          'active': true
        }, {
          'id': '2bszcys4jxqsnsxdeg6qqm6c',
          'categoryId': '5khct2ijxd6y5kmihxwtiprc',
          'name': 'Milk',
          'amount': '',
          'priority': 1,
          'active': false
        }, {
          'id': 'nftbctuenb53la2etqlwzppd',
          'categoryId': '5khct2ijxd6y5kmihxwtiprc',
          'name': 'Butter',
          'amount': '',
          'priority': 2,
          'active': false
        }]
      };
    case '/demo/api/shopping/category/oq6ce5s7ght7erm3xowzen64':
      return {
        'id': 'oq6ce5s7ght7erm3xowzen64',
        'name': 'Drinks',
        'priority': 2,
        'shoppingItems': [{
          'id': 'fwgqeyttpbcdx2pgcj5oq53f',
          'categoryId': 'oq6ce5s7ght7erm3xowzen64',
          'name': 'Beer',
          'amount': '',
          'priority': 0,
          'active': false
        }]
      };
    case '/demo/api/shopping/category/yusmvqb5tggzcf7wtz2wivrb':
      return {
        'id': 'yusmvqb5tggzcf7wtz2wivrb',
        'name': 'Fresh Produce',
        'priority': 0,
        'shoppingItems': [{
          'id': 'mi6fk2tpjq56qqq5wxvdcyus',
          'categoryId': 'yusmvqb5tggzcf7wtz2wivrb',
          'name': 'Apple',
          'amount': '2x',
          'priority': 0,
          'active': true
        }, {
          'id': '4btekfqouwi5f5lnsj2lxsxo',
          'categoryId': 'yusmvqb5tggzcf7wtz2wivrb',
          'name': 'Cucumber',
          'amount': '',
          'priority': 1,
          'active': true
        }, {
          'id': 'ugwhlp5xghelkxyfae25mqbl',
          'categoryId': 'yusmvqb5tggzcf7wtz2wivrb',
          'name': 'Onion',
          'amount': '',
          'priority': 2,
          'active': false
        }]
      };
    case '/demo/api/shopping/hasNoCategories':
      return false;
    case '/demo/api/shopping/items':
      return [{
        'id': 'mi6fk2tpjq56qqq5wxvdcyus',
        'categoryId': 'yusmvqb5tggzcf7wtz2wivrb',
        'name': 'Apple',
        'amount': '2x',
        'priority': 0,
        'active': true
      }, {
        'id': '4btekfqouwi5f5lnsj2lxsxo',
        'categoryId': 'yusmvqb5tggzcf7wtz2wivrb',
        'name': 'Cucumber',
        'amount': '',
        'priority': 1,
        'active': true
      }, {
        'id': 'wnh7keqhiynzjdpiulzcrev3',
        'categoryId': '5khct2ijxd6y5kmihxwtiprc',
        'name': 'Yogurt',
        'amount': '500g',
        'priority': 0,
        'active': true
      }, {
        'id': 'ugwhlp5xghelkxyfae25mqbl',
        'categoryId': 'yusmvqb5tggzcf7wtz2wivrb',
        'name': 'Onion',
        'amount': '',
        'priority': 2,
        'active': false
      }, {
        'id': '2bszcys4jxqsnsxdeg6qqm6c',
        'categoryId': '5khct2ijxd6y5kmihxwtiprc',
        'name': 'Milk',
        'amount': '',
        'priority': 1,
        'active': false
      }, {
        'id': 'nftbctuenb53la2etqlwzppd',
        'categoryId': '5khct2ijxd6y5kmihxwtiprc',
        'name': 'Butter',
        'amount': '',
        'priority': 2,
        'active': false
      }, {
        'id': 'fwgqeyttpbcdx2pgcj5oq53f',
        'categoryId': 'oq6ce5s7ght7erm3xowzen64',
        'name': 'Beer',
        'amount': '',
        'priority': 0,
        'active': false
      }];
    case '/demo/api/shopping/itemSuggestions':
      return [];
    case '/demo/api/shopping/lastPurchaseDate':
      return '2026-04-30T17:57:15.025Z';
    case '/demo/api/shopping/purchases':
      return [{
        'id': 'c6j2yskxnk36nka5slsekw5u',
        'date': '2026-04-30T17:57:15.025Z',
        'userId': 'ijy3sl4ltrhzeqxdsevv6ioc',
        'balanceEntryId': '3hxtchg6d66gb5e5djh4erev',
        'shoppingItems': [{
          'purchaseId': 'c6j2yskxnk36nka5slsekw5u',
          'itemId': '2bszcys4jxqsnsxdeg6qqm6c'
        }, { 'purchaseId': 'c6j2yskxnk36nka5slsekw5u', 'itemId': 'nftbctuenb53la2etqlwzppd' }],
        'user': {
          'id': 'ijy3sl4ltrhzeqxdsevv6ioc',
          'username': 'alice',
          'password': '$argon2id$v=19$m=65536,t=3,p=1$FKoMqe2bRUVTJKDujjPcEw$k/ZOoqTqXHWCNFwdyi9DPPJpV+KFFHVU84i2hepsbSM',
          'defaultDistribution': 60
        },
        'balanceEntry': {
          'id': '3hxtchg6d66gb5e5djh4erev',
          'date': '2026-04-30T17:57:31.739Z',
          'userId': 'ijy3sl4ltrhzeqxdsevv6ioc',
          'price': 599,
          'name': 'Groceries'
        }
      }, {
        'id': 'elra23bg2vjglmipckfzdofl',
        'date': '2026-04-30T17:57:05.606Z',
        'userId': 'ijy3sl4ltrhzeqxdsevv6ioc',
        'balanceEntryId': null,
        'shoppingItems': [{ 'purchaseId': 'elra23bg2vjglmipckfzdofl', 'itemId': 'ugwhlp5xghelkxyfae25mqbl' }],
        'user': {
          'id': 'ijy3sl4ltrhzeqxdsevv6ioc',
          'username': 'alice',
          'password': '$argon2id$v=19$m=65536,t=3,p=1$FKoMqe2bRUVTJKDujjPcEw$k/ZOoqTqXHWCNFwdyi9DPPJpV+KFFHVU84i2hepsbSM',
          'defaultDistribution': 60
        },
        'balanceEntry': null
      }];
    case '/demo/api/shopping/stagedItems':
      return null;
    case '/demo/api/balance':
      return [{
        'id': 'ekxcjzfknxqy7ijizz6jyqnj',
        'date': '2026-04-30T17:58:06.573Z',
        'userId': 'qpk4jeps6xviipxpxoah34s4',
        'price': 3000,
        'name': 'Concert Tickets',
        'user': {
          'id': 'qpk4jeps6xviipxpxoah34s4',
          'username': 'bob',
          'password': '$argon2id$v=19$m=65536,t=3,p=1$uXCgnDAxJpVhx4EZOGhI3Q$xtipMU072/V42adSVWdkjQed2qhUr3zo25Of5jUG45c',
          'defaultDistribution': 40
        }
      }, {
        'id': '3hxtchg6d66gb5e5djh4erev',
        'date': '2026-04-30T17:57:31.739Z',
        'userId': 'ijy3sl4ltrhzeqxdsevv6ioc',
        'price': 599,
        'name': 'Groceries',
        'user': {
          'id': 'ijy3sl4ltrhzeqxdsevv6ioc',
          'username': 'alice',
          'password': '$argon2id$v=19$m=65536,t=3,p=1$FKoMqe2bRUVTJKDujjPcEw$k/ZOoqTqXHWCNFwdyi9DPPJpV+KFFHVU84i2hepsbSM',
          'defaultDistribution': 60
        }
      }];
    case '/demo/api/balance/debts':
      return [{
        'creditor': {
          'id': 'qpk4jeps6xviipxpxoah34s4',
          'username': 'bob',
          'password': '$argon2id$v=19$m=65536,t=3,p=1$uXCgnDAxJpVhx4EZOGhI3Q$xtipMU072/V42adSVWdkjQed2qhUr3zo25Of5jUG45c',
          'defaultDistribution': 40
        },
        'debtorData': [{
          'debtor': {
            'id': 'ijy3sl4ltrhzeqxdsevv6ioc',
            'username': 'alice',
            'password': '$argon2id$v=19$m=65536,t=3,p=1$FKoMqe2bRUVTJKDujjPcEw$k/ZOoqTqXHWCNFwdyi9DPPJpV+KFFHVU84i2hepsbSM',
            'defaultDistribution': 60
          }, 'amount': 450
        }]
      }];
    case '/demo/api/balance/3hxtchg6d66gb5e5djh4erev':
      return {
        'id': '3hxtchg6d66gb5e5djh4erev',
        'date': '2026-04-30T17:57:31.739Z',
        'userId': 'ijy3sl4ltrhzeqxdsevv6ioc',
        'price': 599,
        'name': 'Groceries',
        'distributions': [{
          'entryId': '3hxtchg6d66gb5e5djh4erev',
          'userId': 'ijy3sl4ltrhzeqxdsevv6ioc',
          'percent': 50
        }, { 'entryId': '3hxtchg6d66gb5e5djh4erev', 'userId': 'qpk4jeps6xviipxpxoah34s4', 'percent': 50 }]
      };
    case '/demo/api/balance/ekxcjzfknxqy7ijizz6jyqnj':
      return {
        'id': 'ekxcjzfknxqy7ijizz6jyqnj',
        'date': '2026-04-30T17:58:06.573Z',
        'userId': 'qpk4jeps6xviipxpxoah34s4',
        'price': 3000,
        'name': 'Concert Tickets',
        'distributions': [{
          'entryId': 'ekxcjzfknxqy7ijizz6jyqnj',
          'userId': 'ijy3sl4ltrhzeqxdsevv6ioc',
          'percent': 25
        }, { 'entryId': 'ekxcjzfknxqy7ijizz6jyqnj', 'userId': 'qpk4jeps6xviipxpxoah34s4', 'percent': 75 }]
      };
    case '/demo/api/tasks':
      return {
        'dueTasks': [{
          'id': 'razpmmyfyzvk4mibxdhqhhau',
          'createdAt': '2026-04-30T18:02:40.897Z',
          'name': 'Scrub toilet',
          'dueWeekday': 'thu',
          'interval': 1,
          'dueUserId': 'qpk4jeps6xviipxpxoah34s4',
          'dueDate': '2026-04-29',
          'dueUser': {
            'id': 'qpk4jeps6xviipxpxoah34s4',
            'username': 'bob',
            'password': '$argon2id$v=19$m=65536,t=3,p=1$uXCgnDAxJpVhx4EZOGhI3Q$xtipMU072/V42adSVWdkjQed2qhUr3zo25Of5jUG45c',
            'defaultDistribution': 40
          },
          'completions': []
        }, {
          'id': 'apublhpqplwooq3r7c4m7pql',
          'createdAt': '2026-04-30T17:59:12.748Z',
          'name': 'Sign us up for flea market',
          'dueUserId': null,
          'dueDate': '2026-04-30',
          'done': false,
          'dueUser': null
        }],
        'completedTasks': [{
          'id': 'bbiajc2n6bjcb76mrvaxkntw',
          'createdAt': '2026-04-30T17:59:43.729Z',
          'name': 'Clean up kitchen',
          'dueWeekday': 'fri',
          'interval': 2,
          'dueUserId': 'ijy3sl4ltrhzeqxdsevv6ioc',
          'dueDate': '2026-05-08',
          'dueUser': {
            'id': 'ijy3sl4ltrhzeqxdsevv6ioc',
            'username': 'alice',
            'password': '$argon2id$v=19$m=65536,t=3,p=1$FKoMqe2bRUVTJKDujjPcEw$k/ZOoqTqXHWCNFwdyi9DPPJpV+KFFHVU84i2hepsbSM',
            'defaultDistribution': 60
          },
          'completions': [{
            'id': 'n33xy3kfrjf2htynws435hiy',
            'taskId': 'bbiajc2n6bjcb76mrvaxkntw',
            'userId': 'qpk4jeps6xviipxpxoah34s4',
            'date': '2026-04-30'
          }]
        }]
      };
    case '/demo/api/tasks/single/apublhpqplwooq3r7c4m7pql':
      return {
        'id': 'apublhpqplwooq3r7c4m7pql',
        'createdAt': '2026-04-30T17:59:12.748Z',
        'name': 'Sign us up for flea market',
        'dueUserId': null,
        'dueDate': '2026-04-30',
        'done': false
      };
    case '/demo/api/tasks/single/bbiajc2n6bjcb76mrvaxkntw':
      return {
        'id': 'bbiajc2n6bjcb76mrvaxkntw',
        'createdAt': '2026-04-30T17:59:43.729Z',
        'name': 'Clean up kitchen',
        'dueWeekday': 'fri',
        'interval': 2,
        'dueUserId': 'ijy3sl4ltrhzeqxdsevv6ioc',
        'dueDate': '2026-05-08',
        'completions': [{
          'id': 'n33xy3kfrjf2htynws435hiy',
          'taskId': 'bbiajc2n6bjcb76mrvaxkntw',
          'userId': 'qpk4jeps6xviipxpxoah34s4',
          'date': '2026-04-30'
        }]
      };
    case '/demo/api/tasks/weekly/razpmmyfyzvk4mibxdhqhhau':
      return {
        'id': 'razpmmyfyzvk4mibxdhqhhau',
        'createdAt': '2026-04-30T18:02:40.897Z',
        'name': 'Scrub toilet',
        'dueWeekday': 'thu',
        'interval': 1,
        'dueUserId': 'qpk4jeps6xviipxpxoah34s4',
        'dueDate': '2026-04-29',
        'completions': []
      };
    case '/demo/api/tasks/dueTaskCount':
      return 2;
    case '/demo/api/update':
      return { 'hasUpdate': false, 'latestVersion': '2.5.2', 'currentVersion': '2.5.2' };
  }

  console.warn('Route not mocked yet!');
  return {};
}