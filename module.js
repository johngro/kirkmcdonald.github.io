/*Copyright 2015-2019 Kirk McDonald

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.*/
"use strict"

function Module(name, col, row, category, order, productivity, speed, power, limit) {
    // Other module effects not modeled by this calculator.
    this.name = name
    this.icon_col = col
    this.icon_row = row
    this.category = category
    this.order = order
    this.productivity = productivity
    this.speed = speed
    this.power = power
    this.limit = {}
    if (limit) {
        for (var i = 0; i < limit.length; i++) {
            this.limit[limit[i]] = true
        }
    }
}
Module.prototype = {
    constructor: Module,
    shortName: function() {
        return this.name[0] + this.name[this.name.length - 1]
    },
    canUse: function(recipe) {
        if (recipe.allModules()) {
            return true
        }
        if (Object.keys(this.limit).length > 0) {
            return recipe.name in this.limit
        }
        return true
    },
    canBeacon: function() {
        return this.productivity.isZero()
    },
    hasProdEffect: function() {
        return !this.productivity.isZero()
    },
    renderTooltip: function() {
        var t = document.createElement("div")
        t.classList.add("frame")
        var title = document.createElement("h3")
        title.appendChild(getImage(this, true))
        title.appendChild(new Text(formatName(this)))
        t.appendChild(title)
        var b
        var hundred = RationalFromFloat(100)
        var first = false
        if (!this.power.isZero()) {
            var power = this.power.mul(hundred)
            if (first) {
                t.appendChild(document.createElement("br"))
            } else {
                first = true
            }
            b = document.createElement("b")
            b.textContent = "Energy consumption: "
            t.appendChild(b)
            var sign = ""
            if (!this.power.less(zero)) {
                sign = "+"
            }
            t.appendChild(new Text(sign + power.toDecimal() + "%"))
        }
        if (!this.speed.isZero()) {
            var speed = this.speed.mul(hundred)
            if (first) {
                t.appendChild(document.createElement("br"))
            } else {
                first = true
            }
            b = document.createElement("b")
            b.textContent = "Speed: "
            t.appendChild(b)
            var sign = ""
            if (!this.speed.less(zero)) {
                sign = "+"
            }
            t.appendChild(new Text(sign + speed.toDecimal() + "%"))
        }
        if (!this.productivity.isZero()) {
            var productivity = this.productivity.mul(hundred)
            if (first) {
                t.appendChild(document.createElement("br"))
            } else {
                first = true
            }
            b = document.createElement("b")
            b.textContent = "Productivity: "
            t.appendChild(b)
            var sign = ""
            if (!this.productivity.less(zero)) {
                sign = "+"
            }
            t.appendChild(new Text(sign + productivity.toDecimal() + "%"))
        }
        return t
    }
}

function moduleDropdown(name, initial_selection, callback, filter) {
    let options_generator = (selector) => {
        let rows = [[null]].concat(moduleRows)

        let options = selector.dropdown.selectAll("div")
            .data(rows)
            .join("div")
                .selectAll("span")
                .data(d => d)
                .join("span")

        if (filter) {
            options = options.filter(filter)
        }

        return options
    }

    let content_generator = (selector, d) => {
        if (d === null) {
            let noModImage = getExtraImage("slot_icon_module")
            noModImage.title = NO_MODULE
            return noModImage
        } else {
            return getImage(d, false, selector.dropdown.node(), selector.tooltip_container)
        }
    }

    return new Selector(name, options_generator, content_generator, initial_selection, callback)
}

function getModules(data) {
    var modules = {}
    for (var i = 0; i < data.modules.length; i++) {
        var name = data.modules[i]
        var item = data.items[name]
        var effect = item.effect
        var category = item.category
        var order = item.order
        var speed = RationalFromFloat((effect.speed || {}).bonus || 0)
        var productivity = RationalFromFloat((effect.productivity || {}).bonus || 0)
        var power = RationalFromFloat((effect.consumption || {}).bonus || 0)
        var limit = item.limitation
        modules[name] = new Module(
            name,
            item.icon_col,
            item.icon_row,
            category,
            order,
            productivity,
            speed,
            power,
            limit
        )
    }
    return modules
}
