import React from 'react';
import {} from '@mui/material';
import PropTypes from 'prop-types';

// import { I18n } from '@iobroker/adapter-react-v5';
import { VisRxWidget } from '@iobroker/vis-2-widgets-react-dev';
import VisEJSAttibuteField from './Components/VisEJSAttibuteField.tsx';
import InnerHtml from './Components/InnerHTML.jsx';

const ejs = require('ejs');
const rssExample = require('./rss.json');

class RSSMultiWidget extends (window.visRxWidget || VisRxWidget) {
    static getWidgetInfo() {
        const defaulttemplate = `
<!--
 available variables:
 widgetid      ->  id of the widget 
 rss.articles  ->  all articles as array, details see Article Helper widget 
 style         ->  all style settings for the widget
 
 all variables are read only
-->

<style> 
#<%- widgetid %> img {
    width: calc(<%- style.width || "230px" %> - 15px);
    height: auto;
}
#<%- widgetid %> img.rssfeed  {
    width: auto;
    height: auto;
}
</style> 
<% rss.articles.forEach(function(item){ %>
    <p><%- item.meta_name || item.meta_title || '' %></p>
    <p><small><%- vis.formatDate(item.pubdate, "TT.MM.JJJJ SS:mm") %></small></p>
    <h3><%- item.title %></h3>
    <p><%- item.description %></p>
    <div style="clear:both;" />
<% }); %>
                `;
        return {
            id: 'tplRSSMultiWidget',
            visSet: 'vis-2-widgets-rssfeed',
            visName: 'RSSFeed Multi Widget', // Name of widget
            visAttrs: [
                {
                    name: 'common', // group name
                    fields: [
                        {
                            name: 'feedcount', // name in data structure
                            type: 'number',
                            default: 1,
                            min: 1,
                            max: Number.MAX_VALUE,
                            step: 1,
                            label: 'vis_2_widgets_rssfeed_multi_feedcount', // translated field label
                            onChange: async (field, data, changeData) => {
                                const { count } = data;
                                for (let i = 0; i <= count; i++) {
                                    data[`g_feeds-${i}`] = true;
                                }
                                changeData(data);
                            },
                        },
                        {
                            name: 'template', // name in data structure
                            type: 'custom',
                            label: 'vis_2_widgets_rssfeed_widget_template', // translated field label
                            default: defaulttemplate,
                            component: (
                                // important
                                field, // field properties: {name, label, type, set, singleName, component,...}
                                data, // widget data
                                onDataChange, // function to call, when data changed
                                props, // additional properties : {socket, projectName, instance, adapterName, selectedView, selectedWidgets, project, widgetID}
                                // socket,      // socket object
                                // widgetID,    // widget ID or widgets IDs. If selecteld more than one widget, it is array of IDs
                                // view,        // view name
                                // project,      // project object: {VIEWS..., [view]: {widgets: {[widgetID]: {tpl, data, style}}, settings, parentId, rerender, filterList, activeWidgets}, __settings: {}}
                            ) => (
                                <VisEJSAttibuteField
                                    visSocket={props.context.socket}
                                    field={field}
                                    data={data}
                                    onDataChange={onDataChange}
                                    props
                                />
                            ),
                        },
                        {
                            name: 'dpcount', // name in data structure
                            type: 'number',
                            default: 1,
                            min: 1,
                            max: Number.MAX_VALUE,
                            step: 1,
                            label: 'vis_2_widgets_rssfeed_multi_dpcount', // translated field label
                            onChange: async (field, data, changeData) => {
                                const { dpcount } = data;
                                for (let i = 0; i <= dpcount; i++) {
                                    data[`g_datapoints-${i}`] = true;
                                }
                                changeData(data);
                            },
                        },
                    ],
                },
                {
                    name: 'feeds', // group name
                    label: 'vis_2_widgets_rssfeed_multi_feedsgroup', // translated group label
                    indexFrom: 1,
                    indexTo: 'feedcount',
                    onChange: async (field, data, changeData) => {
                        changeData(data);
                    },
                    fields: [
                        {
                            name: 'feed-oid', // name in data structure
                            type: 'id',
                            label: 'vis_2_widgets_rssfeed_multi_oid', // translated field label
                        },
                        {
                            name: 'feed-name', // name in data structure
                            type: 'text',
                            label: 'vis_2_widgets_rssfeed_multi_name', // translated field label
                        },
                        {
                            name: 'feed-maxarticles', // name in data structure
                            type: 'number',
                            default: 10,
                            min: 1,
                            max: Number.MAX_VALUE,
                            step: 1,
                            label: 'vis_2_widgets_rssfeed_multi_maxarticles', // translated field label
                        },
                        {
                            name: 'feed-filter', // name in data structure
                            type: 'text',
                            label: 'vis_2_widgets_rssfeed_multi_filter', // translated field label
                        },
                    ],
                },
                {
                    name: 'datapoints', // group name
                    label: 'vis_2_widgets_rssfeed_multi_datapointsgroup', // translated group label
                    indexFrom: 1,
                    indexTo: 'dpcount',
                    onChange: async (field, data, changeData) => {
                        changeData(data);
                    },
                    fields: [
                        {
                            name: 'datapoint_oid',
                            label: 'vis_2_widgets_rssfeed_multi_datapoints_oid',
                            type: 'text',
                        },
                    ],
                },
                // check here all possible types https://github.com/ioBroker/ioBroker.vis/blob/react/src/src/Attributes/Widget/SCHEMA.md
            ],
            visDefaultStyle: {
                // default style
                width: 300,
                height: 260,
            },
            visPrev: '',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    propertiesUpdate() {
        // Widget has 3 important states
        // 1. this.state.values - contains all state values, that are used in widget (automatically collected from widget info).
        //                        So you can use `this.state.values[this.state.rxData.oid + '.val']` to get value of state with id this.state.rxData.oid
        // 2. this.state.rxData - contains all widget data with replaced bindings. E.g. if this.state.data.type is `{system.adapter.admin.0.alive}`,
        //                        then this.state.rxData.type will have state value of `system.adapter.admin.0.alive`
        // 3. this.state.rxStyle - contains all widget styles with replaced bindings. E.g. if this.state.styles.width is `{javascript.0.width}px`,
        //                        then this.state.rxData.type will have state value of `javascript.0.width` + 'px
    }

    componentDidMount() {
        super.componentDidMount();

        // Update data
        this.propertiesUpdate();
    }

    // Do not delete this method. It is used by vis to read the widget configuration.
    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo() {
        return RSSMultiWidget.getWidgetInfo();
    }

    // This function is called every time when rxData is changed
    onRxDataChanged() {
        this.propertiesUpdate();
    }

    // This function is called every time when rxStyle is changed
    // eslint-disable-next-line class-methods-use-this
    onRxStyleChanged() {}

    // This function is called every time when some Object State updated, but all changes lands into this.state.values too
    // eslint-disable-next-line class-methods-use-this, no-unused-vars
    onStateUpdated(id, state) {}

    // eslint-disable-next-line class-methods-use-this
    checkFilter(value, filters, sep) {
        sep = typeof sep !== 'undefined' ? sep : ';';
        const filter = filters.split(sep);
        return filter.reduce((acc, cur) => {
            if (cur === '') return acc;
            return acc || value.toLowerCase().indexOf(cur.toLowerCase()) >= 0;
        }, false);
    }

    /*     // eslint-disable-next-line class-methods-use-this
    escapeHTML(html) {
        let escapeEl = document.createElement('textarea');
        escapeEl.textContent = html;
        const ret = escapeEl.innerHTML;
        escapeEl = null;
        return ret;
    } */

    renderWidgetBody(props) {
        super.renderWidgetBody(props);
        const data = props.widget.data;
        const errortemplate = `
        No Object ID set
        `;
        const template = data.template;
        const keys = Object.keys(this.state.data).filter((key) => /g_feeds-(\d+)/gm.test(key));
        let articles = [];
        if (keys.length > 0) {
            articles = keys.reduce((acc, key) => {
                if (key === 'g_feeds-0') return acc;
                const id = /g_feeds-(\d+)/gm.exec(key)[1];
                const rss = JSON.parse(
                    this.state.values[`${this.state.data[`feed-oid${id}`]}.val`] || JSON.stringify(rssExample),
                );
                if (!Object.prototype.hasOwnProperty.call(rss, 'articles')) return acc;
                const maxarticles = this.state.data[`feed-maxarticles${id}`] || 999;
                const filter = this.state.data[`feed-filter${id}`];
                const name = this.state.data[`feed-name${id}`];
                if (filter) {
                    rss.articles = rss.articles.filter((item) =>
                        this.checkFilter(item.title + item.description + item.categories.toString(), filter),
                    );
                }
                if (rss && rss.articles && rss.articles.length > maxarticles)
                    rss.articles = rss.articles.slice(0, maxarticles);
                rss.articles = rss.articles.map((item) => ({
                    title: item.title,
                    description: item.description,
                    categories: item.categories,
                    date: item.date,
                    link: item.link,
                    meta_description: rss.meta.description,
                    meta_name: name,
                    meta_title: rss.meta.title,
                }));

                return acc.concat(rss.articles);
            }, []);
        } else {
            const rss = JSON.parse(JSON.stringify(rssExample));
            articles = rss.articles;
        }
        articles.sort((aEl, bEl) => new Date(bEl.date) - new Date(aEl.date));
        let text = '';
        try {
            if (articles.length === 0) {
                text = ejs.render(errortemplate, {});
            } else {
                text = ejs.render(template, { rss: { articles }, widgetid: props.id, style: props.style });
            }
        } catch (e) {
            text = this.escapeHTML(e.message).replace(/(?:\r\n|\r|\n)/g, '<br>');
            text = text.replace(/ /gm, '&nbsp;');
            text = `<code style="color:red;">${text}</code>`;
        }

        return (
            <InnerHtml style={{ width: '100%', height: '100%', position: 'relative', overflow: 'auto' }} html={text} />
        );
    }
}
RSSMultiWidget.propTypes = {
    systemConfig: PropTypes.object,
    socket: PropTypes.object,
    themeType: PropTypes.string,
    style: PropTypes.object,
    data: PropTypes.object,
};

export default RSSMultiWidget;
