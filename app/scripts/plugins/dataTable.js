import $ from 'jquery';

const dataTable = (selector) => {
  $(selector).bootstrapTable({
    queryParams(params) {
      const { search, sort, order, offset, limit } = params;
      console.log(search);
      const query = {};
      Object.assign(query, {
        qType: 'allTotal',
        skip: offset,
        sort: order === 'desc' ? `-${sort}` : sort,
        limit,
      });

      return query;
    },
    responseHandler(res) {
      if (res && res.data) {
        res = res.data;
      }

      return res;
    },
  });
};

export default () => {
  dataTable('.data-table');
};
