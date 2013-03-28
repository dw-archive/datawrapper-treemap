
(function(){
    // Simple Treemap
    // --------------

    var Treemap = Datawrapper.Visualizations.Treemap = function() {

    };

    _.extend(Treemap.prototype, Datawrapper.Visualizations.RaphaelChart.prototype, {

        render: function(el) {

            el = $(el);
            this.setRoot(el);
            var me = this,
                row = 0;

            var filterUI = me.getFilterUI(row);
            if (filterUI) $('#header').append(filterUI);

            var c = me.initCanvas();

            var tree = me.dataset.parseTree(0),
                treemap = d3_treemap.layout.treemap();

            c.lpad += 1;
            c.rpad = 2;
            c.bpad = 2;

            var area = c.w * c.h;

            var customColors = me.get('custom-colors', {});

            var legend_items = [];

            _.each(customColors, function(col, key) {
                if (col) legend_items.push({ label: key, color: col });
            });
            if (legend_items.length > 0) {
                me.addLegend(legend_items, $('#header', c.root.parent()));
                c.tpad += 20;
            }

            treemap.size([c.w - c.lpad - c.rpad, c.h - c.tpad - c.bpad]).padding(0);
            treemap(tree);

            function getColor(node) {
                if (customColors[node.name]) {
                    node.color = customColors[node.name];
                    return node.color;
                }
                // try parent node
                if (node.parent && node.parent._series) {
                    var col = getColor(node.parent);
                    var c = node.parent.children.indexOf(node) / node.parent.children.length;
                    return chroma.color(col).darken((c-0.5)*20).hex();
                }
                return me.getSeriesColor(node._series, node._row);
            }


            function renderNode(node) {
                if (node.children.length === 0) {
                    var color = getColor(node);
                    c.paper.rect().attr({
                        x: c.lpad + node.x,
                        y: c.tpad + node.y,
                        width: node.dx,
                        height: node.dy,
                        fill: color,
                        // stroke: false,
                        stroke: chroma.color(color).darken().hex(),
                        r: 0
                    });
                    if (node.name) {
                        var tx = c.lpad + node.x + node.dx * 0.5,
                            ty = c.tpad + node.y + node.dy* 0.5;
                        var lbl = me.label(tx, ty, node.name).attr({
                            align: 'center',
                            valign: 'middle',
                            size: Math.sqrt((node.dy * node.dx) / area) * Math.sqrt(area)/8
                        });
                        if (me.invertLabel(color)) lbl.addClass('inverted');
                    }
                }
                _.each(node.children, renderNode);
            }
            renderNode(tree, 0);
        }
    });


}).call(this);
